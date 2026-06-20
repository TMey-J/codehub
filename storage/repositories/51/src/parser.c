#include "shell.h"

char *here_document(char *delim) {
    char *result = NULL;
    size_t total = 0;
    char *line = NULL;
    size_t n = 0;
    result = malloc(1);
    result[0] = '\0';
    while (getline(&line, &n, stdin) != -1) {
        if (strncmp(line, delim, strlen(delim)) == 0 && line[strlen(delim)] == '\n') break;
        total += strlen(line);
        result = realloc(result, total + 1);
        strcat(result, line);
    }
    free(line);
    return result;
}

char **parse_line(char *line, int *bg) {
    // Handle here documents first
    char *heredoc = strstr(line, "<<");
    if (heredoc) {
        char *delim = heredoc + 2;
        while (isspace(*delim)) delim++;
        char *end = delim;
        while (*end && !isspace(*end)) end++;
        if (end > delim) {
            char delim_str[128];
            int len = end - delim;
            strncpy(delim_str, delim, len);
            delim_str[len] = '\0';
            char *content = here_document(delim_str);
            // replace the <<... with the content in a temp file
            char tempfile[] = "/tmp/codehub_heredoc_XXXXXX";
            int fd = mkstemp(tempfile);
            if (fd != -1) {
                write(fd, content, strlen(content));
                close(fd);
                // replace "<<delim" with "< tempfile"
                char *newline = malloc(strlen(line) + strlen(tempfile) + 10);
                int pos = heredoc - line;
                strncpy(newline, line, pos);
                newline[pos] = '\0';
                sprintf(newline + pos, "< %s", tempfile);
                strcat(newline, end);
                free(line);
                line = newline;
            }
            free(content);
        }
    }

    char **raw = malloc(MAX_ARGS * sizeof(char *));
    int i = 0;
    char *token = strtok(line, " ");
    while (token && i < MAX_ARGS - 1) {
        raw[i++] = token;
        token = strtok(NULL, " ");
    }
    raw[i] = NULL;
    *bg = 0;
    if (i > 0 && strcmp(raw[i-1], "&") == 0) {
        *bg = 1;
        raw[i-1] = NULL;
    }

    char **expanded = expand_args(raw);
    free(raw);

    if (expanded[0]) {
        char *alias_val = alias_get(expanded[0]);
        if (alias_val) {
            char *new_line = malloc(strlen(alias_val) + 1);
            strcpy(new_line, alias_val);
            for (int j = 1; expanded[j]; j++) {
                new_line = realloc(new_line, strlen(new_line) + strlen(expanded[j]) + 2);
                strcat(new_line, " ");
                strcat(new_line, expanded[j]);
            }
            char **aliased = parse_line(new_line, bg);
            free(new_line);
            for (int j = 0; expanded[j]; j++) free(expanded[j]);
            free(expanded);
            return aliased;
        }
    }

    return expanded;
}

char ***parse_pipeline(char **args, int *num_cmds) {
    char ***cmds = malloc(MAX_CMDS * sizeof(char **));
    int cmd_idx = 0;
    int arg_idx = 0;
    cmds[cmd_idx] = malloc(MAX_ARGS * sizeof(char *));
    int pos = 0;

    while (args[arg_idx]) {
        if (strcmp(args[arg_idx], "|") == 0) {
            cmds[cmd_idx][pos] = NULL;
            cmd_idx++;
            cmds[cmd_idx] = malloc(MAX_ARGS * sizeof(char *));
            pos = 0;
            arg_idx++;
            continue;
        }
        cmds[cmd_idx][pos++] = args[arg_idx++];
    }
    cmds[cmd_idx][pos] = NULL;
    *num_cmds = cmd_idx + 1;
    return cmds;
}

void free_argv(char **argv) {
    free(argv);
}

void free_cmds(char ***cmds, int num_cmds) {
    for (int i = 0; i < num_cmds; i++) free(cmds[i]);
    free(cmds);
}
