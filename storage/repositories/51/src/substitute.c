#include "shell.h"

char *substitute_command(char *cmd) {
    char *p = cmd;
    int len = strlen(cmd);
    char *buffer = malloc(len + 1024);
    buffer[0] = '\0';

    while (1) {
        char *start = strstr(p, "$(");
        char *backtick = strchr(p, '`');
        char *sub_start = NULL;
        char *sub_end = NULL;
        int use_backtick = 0;

        if (start && (!backtick || start < backtick)) {
            sub_start = start + 2;
            sub_end = strstr(sub_start, ")");
            use_backtick = 0;
        } else if (backtick) {
            sub_start = backtick + 1;
            sub_end = strchr(sub_start, '`');
            use_backtick = 1;
        }
        if (!sub_start || !sub_end) break;

        int cmd_len = sub_end - sub_start;
        char subcmd[cmd_len + 1];
        strncpy(subcmd, sub_start, cmd_len);
        subcmd[cmd_len] = '\0';

        int pipefd[2];
        if (pipe(pipefd) == -1) { perror("pipe"); break; }
        pid_t pid = fork();
        if (pid == -1) { perror("fork"); break; }
        if (pid == 0) {
            close(pipefd[0]);
            dup2(pipefd[1], STDOUT_FILENO);
            close(pipefd[1]);
            execl("/bin/sh", "sh", "-c", subcmd, NULL);
            exit(1);
        } else {
            close(pipefd[1]);
            char output[4096];
            int n = read(pipefd[0], output, sizeof(output) - 1);
            output[n > 0 ? n : 0] = '\0';
            close(pipefd[0]);
            waitpid(pid, NULL, 0);
            if (output[strlen(output) - 1] == '\n') output[strlen(output) - 1] = '\0';
            strcat(buffer, output);
            char *rest = sub_end + (use_backtick ? 1 : 1);
            p = rest;
        }
    }
    strcat(buffer, p);
    char *final = strdup(buffer);
    free(buffer);
    return final;
}
