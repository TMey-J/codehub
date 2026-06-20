#include "shell.h"

static void setup_redirections(char **args) {
    int i = 0;
    while (args[i]) {
        if (strcmp(args[i], "<") == 0) {
            if (!args[i+1]) { fprintf(stderr, "missing input file\n"); exit(1); }
            int fd = open(args[i+1], O_RDONLY);
            if (fd < 0) { perror("open input"); exit(1); }
            dup2(fd, STDIN_FILENO);
            close(fd);
            args[i] = NULL;
            i += 2;
        } else if (strcmp(args[i], ">") == 0) {
            if (!args[i+1]) { fprintf(stderr, "missing output file\n"); exit(1); }
            int fd = open(args[i+1], O_WRONLY | O_CREAT | O_TRUNC, 0644);
            if (fd < 0) { perror("open output"); exit(1); }
            dup2(fd, STDOUT_FILENO);
            close(fd);
            args[i] = NULL;
            i += 2;
        } else if (strcmp(args[i], ">>") == 0) {
            if (!args[i+1]) { fprintf(stderr, "missing output file\n"); exit(1); }
            int fd = open(args[i+1], O_WRONLY | O_CREAT | O_APPEND, 0644);
            if (fd < 0) { perror("open append"); exit(1); }
            dup2(fd, STDOUT_FILENO);
            close(fd);
            args[i] = NULL;
            i += 2;
        } else {
            i++;
        }
    }
}

void execute_pipeline(char ***cmds, int num_cmds, int bg, char *cmdline) {
    int pipefds[2];
    int prev_fd = -1;
    pid_t pgid = -1;

    for (int i = 0; i < num_cmds; i++) {
        if (i < num_cmds - 1) {
            if (pipe(pipefds) == -1) { perror("pipe"); exit(1); }
        }

        pid_t pid = fork();
        if (pid == -1) { perror("fork"); exit(1); }

        if (pid == 0) {
            signal(SIGINT, SIG_DFL);
            signal(SIGTSTP, SIG_DFL);
            signal(SIGQUIT, SIG_DFL);

            if (pgid == -1) pgid = getpid();
            setpgid(0, pgid);

            if (prev_fd != -1) {
                dup2(prev_fd, STDIN_FILENO);
                close(prev_fd);
            }
            if (i < num_cmds - 1) {
                close(pipefds[0]);
                dup2(pipefds[1], STDOUT_FILENO);
                close(pipefds[1]);
            }

            setup_redirections(cmds[i]);

            execvp(cmds[i][0], cmds[i]);
            perror("execvp");
            exit(1);
        }

        if (pgid == -1) pgid = pid;
        setpgid(pid, pgid);

        if (prev_fd != -1) close(prev_fd);
        if (i < num_cmds - 1) {
            close(pipefds[1]);
            prev_fd = pipefds[0];
        } else {
            prev_fd = -1;
        }
    }

    if (!bg) {
        tcsetpgrp(STDIN_FILENO, pgid);
        int status;
        waitpid(-pgid, &status, WUNTRACED);
        tcsetpgrp(STDIN_FILENO, getpgrp());

        if (WIFSTOPPED(status)) {
            add_job(pgid, cmdline, 0);
        } else {
            int wpid;
            while ((wpid = waitpid(-pgid, NULL, WNOHANG)) > 0);
        }
    } else {
        add_job(pgid, cmdline, 1);
    }
}
