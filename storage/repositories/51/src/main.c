#include "shell.h"

volatile sig_atomic_t sigchld_received = 0;

void handle_sigchld(int sig) {
    (void)sig;
    sigchld_received = 1;
}

void init_shell(void) {
    struct sigaction sa;
    sa.sa_handler = handle_sigchld;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = SA_RESTART | SA_NOCLDSTOP;
    sigaction(SIGCHLD, &sa, NULL);
    signal(SIGTSTP, SIG_IGN);
    signal(SIGQUIT, SIG_IGN);
    signal(SIGTTOU, SIG_IGN);
    signal(SIGTTIN, SIG_IGN);
    using_history();
    load_rc_file();
}

int main(void) {
    init_shell();
    char *line;
    char **args;
    char ***cmds;
    int bg, num_cmds;

    while (1) {
        if (sigchld_received) {
            sigchld_received = 0;
            update_job_status();
        }
        line = readline(PROMPT);
        if (!line) { printf("\n"); break; }
        if (strlen(line) > 0) add_history(line);

        args = parse_line(line, &bg);
        if (!args[0]) { free(args); free(line); continue; }

        if (!execute_builtin(args)) {
            cmds = parse_pipeline(args, &num_cmds);
            execute_pipeline(cmds, num_cmds, bg, line);
            free_cmds(cmds, num_cmds);
        }
        free(args);
        free(line);
    }
    return 0;
}
