#include "shell.h"
#include <dirent.h>
#include <pwd.h>
#include <grp.h>
#include <time.h>

static void print_color(const char *filename) {
    struct stat st;
    if (stat(filename, &st) == -1) return;
    if (S_ISDIR(st.st_mode)) {
        printf("\033[1;34m%s\033[0m", filename);
    } else if (st.st_mode & S_IXUSR) {
        printf("\033[1;32m%s\033[0m", filename);
    } else if (S_ISLNK(st.st_mode)) {
        printf("\033[1;36m%s\033[0m", filename);
    } else {
        printf("%s", filename);
    }
}

static void ls_long(const char *path) {
    DIR *d = opendir(path);
    if (!d) { perror("ls"); return; }
    struct dirent *entry;
    while ((entry = readdir(d)) != NULL) {
        if (entry->d_name[0] == '.') continue;
        char full[PATH_MAX];
        snprintf(full, sizeof(full), "%s/%s", path, entry->d_name);
        struct stat st;
        if (stat(full, &st) == -1) continue;
        printf("%c%c%c%c%c%c%c%c%c%c ",
            S_ISDIR(st.st_mode) ? 'd' : '-',
            st.st_mode & S_IRUSR ? 'r' : '-',
            st.st_mode & S_IWUSR ? 'w' : '-',
            st.st_mode & S_IXUSR ? 'x' : '-',
            st.st_mode & S_IRGRP ? 'r' : '-',
            st.st_mode & S_IWGRP ? 'w' : '-',
            st.st_mode & S_IXGRP ? 'x' : '-',
            st.st_mode & S_IROTH ? 'r' : '-',
            st.st_mode & S_IWOTH ? 'w' : '-',
            st.st_mode & S_IXOTH ? 'x' : '-');
        printf("%3ld ", st.st_nlink);
        struct passwd *pw = getpwuid(st.st_uid);
        struct group *gr = getgrgid(st.st_gid);
        printf("%s %s ", pw ? pw->pw_name : "?", gr ? gr->gr_name : "?");
        printf("%8ld ", st.st_size);
        char timebuf[20];
        strftime(timebuf, sizeof(timebuf), "%b %d %H:%M", localtime(&st.st_mtime));
        printf("%s ", timebuf);
        print_color(entry->d_name);
        printf("\n");
    }
    closedir(d);
}

static void ls_simple(const char *path) {
    DIR *d = opendir(path);
    if (!d) { perror("ls"); return; }
    struct dirent *entry;
    int first = 1;
    while ((entry = readdir(d)) != NULL) {
        if (entry->d_name[0] == '.') continue;
        if (!first) printf("  ");
        first = 0;
        print_color(entry->d_name);
    }
    printf("\n");
    closedir(d);
}

int execute_builtin(char **args) {
    if (strcmp(args[0], "exit") == 0) {
        exit(0);
    } else if (strcmp(args[0], "cd") == 0) {
        char *dir = args[1] ? args[1] : getenv("HOME");
        if (chdir(dir) != 0) perror("cd");
        return 1;
    } else if (strcmp(args[0], "help") == 0) {
        printf("Built-ins: exit, cd, help, jobs, fg, bg, echo, export, unset, alias, history, source, ls, declare, [[\n");
        return 1;
    } else if (strcmp(args[0], "jobs") == 0) {
        list_jobs();
        return 1;
    } else if (strcmp(args[0], "fg") == 0) {
        int jid = args[1] ? atoi(args[1]) : -1;
        fg_job(jid);
        return 1;
    } else if (strcmp(args[0], "bg") == 0) {
        int jid = args[1] ? atoi(args[1]) : -1;
        bg_job(jid);
        return 1;
    } else if (strcmp(args[0], "echo") == 0) {
        for (int i = 1; args[i]; i++) {
            printf("%s%s", args[i], args[i+1] ? " " : "\n");
        }
        return 1;
    } else if (strcmp(args[0], "export") == 0) {
        if (args[1]) {
            char *eq = strchr(args[1], '=');
            if (eq) {
                *eq = '\0';
                set_env_var(args[1], eq + 1);
            } else {
                set_env_var(args[1], "");
            }
        }
        return 1;
    } else if (strcmp(args[0], "unset") == 0) {
        for (int i = 1; args[i]; i++) unset_env_var(args[i]);
        return 1;
    } else if (strcmp(args[0], "alias") == 0) {
        if (args[1] && strchr(args[1], '=')) {
            char *eq = strchr(args[1], '=');
            *eq = '\0';
            alias_add(args[1], eq + 1);
        } else if (args[1]) {
            char *val = alias_get(args[1]);
            if (val) printf("%s=%s\n", args[1], val);
        } else {
            alias_t *a = alias_list;
            while (a) { printf("%s=%s\n", a->name, a->value); a = a->next; }
        }
        return 1;
    } else if (strcmp(args[0], "history") == 0) {
        HIST_ENTRY **hist = history_list();
        for (int i = 0; hist[i]; i++) {
            printf("%5d  %s\n", i + history_base, hist[i]->line);
        }
        return 1;
    } else if (strcmp(args[0], "source") == 0) {
        if (args[1]) {
            FILE *fp = fopen(args[1], "r");
            if (fp) {
                char *line = NULL;
                size_t n = 0;
                int num_cmds;
                while (getline(&line, &n, fp) != -1) {
                    if (line[0] == '#') continue;
                    char *copy = strdup(line);
                    if (copy[strlen(copy)-1] == '\n') copy[strlen(copy)-1] = '\0';
                    int bg;
                    char **cmd = parse_line(copy, &bg);
                    if (cmd[0]) {
                        if (!execute_builtin(cmd)) {
                            char ***cmds = parse_pipeline(cmd, &num_cmds);
                            execute_pipeline(cmds, num_cmds, bg, copy);
                            free_cmds(cmds, num_cmds);
                        }
                    }
                    free(cmd);
                    free(copy);
                }
                free(line);
                fclose(fp);
            } else perror("source");
        }
        return 1;
    } else if (strcmp(args[0], "ls") == 0) {
        const char *path = ".";
        int long_format = 0;
        for (int i = 1; args[i]; i++) {
            if (strcmp(args[i], "-l") == 0) long_format = 1;
            else path = args[i];
        }
        if (long_format) ls_long(path);
        else ls_simple(path);
        return 1;
    } else if (strcmp(args[0], "declare") == 0) {
        if (args[1] && strcmp(args[1], "-a") == 0 && args[2]) {
            char *eq = strchr(args[2], '=');
            if (eq) {
                *eq = '\0';
                char *name = args[2];
                char *vals = eq + 1;
                array_t a; array_init(&a);
                char *token = strtok(vals, " ");
                while (token) { array_add(&a, token); token = strtok(NULL, " "); }
                set_array(name, &a);
            }
        }
        return 1;
    } else if (strcmp(args[0], "[[") == 0) {
        return test_expression(args + 1);
    }
    return 0;
}
