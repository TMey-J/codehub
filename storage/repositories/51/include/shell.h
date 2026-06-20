#ifndef SHELL_H
#define SHELL_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <signal.h>
#include <errno.h>
#include <readline/readline.h>
#include <readline/history.h>
#include <glob.h>
#include <ctype.h>
#include <regex.h>
#include <stdint.h>

#define MAX_ARGS 128
#define MAX_CMDS 64
#define PROMPT "codehub> "

// ---------- job state constants ----------
enum job_state {
    JOB_RUNNING,
    JOB_STOPPED,
    JOB_TERMINATED
};

typedef struct job {
    int jid;
    pid_t pgid;
    char *cmdline;
    int state;                 // uses values from enum above
    int foreground;
    pid_t *pids;
    int num_pids;
    struct job *next;
} job_t;

typedef struct alias {
    char *name;
    char *value;
    struct alias *next;
} alias_t;

typedef struct array {
    char **items;
    int len;
    int cap;
} array_t;

typedef struct array_entry {
    char *name;
    array_t data;
} array_entry_t;

extern job_t *job_list;
extern int job_count;
extern alias_t *alias_list;
extern array_entry_t *array_entries;
extern int array_entry_count;

void init_shell(void);
void load_rc_file(void);
void handle_sigchld(int sig);

char **parse_line(char *line, int *bg);
char ***parse_pipeline(char **args, int *num_cmds);
char **expand_args(char **args);
char *expand_string(char *str);
char *expand_tilde(char *str);
char **glob_expand(char **args);
void free_argv(char **argv);
void free_cmds(char ***cmds, int num_cmds);

int execute_builtin(char **args);
void execute_pipeline(char ***cmds, int num_cmds, int bg, char *cmdline);

void add_job(pid_t pgid, char *cmdline, int bg);
void remove_job(int jid);
job_t *find_job(int jid);
void update_job_status(void);
void list_jobs(void);
void fg_job(int jid);
void bg_job(int jid);

void alias_add(char *name, char *value);
char *alias_get(char *name);
void alias_load_from_file(FILE *fp);
void alias_save_to_file(FILE *fp);
void alias_free_all(void);

char *get_env_var(const char *name);
void set_env_var(const char *name, const char *value);
void unset_env_var(const char *name);
char *substitute_command(char *cmd);

// ---- bashisms ----
char *expand_brace(char *arg);
char *expand_parameter(char *arg, int *status);
long long eval_arith(char *expr, int *err);
char *here_document(char *delim);
int test_expression(char **args);
char *process_substitution(char *cmd, int mode);

void array_init(array_t *a);
void array_add(array_t *a, char *item);
char **array_to_argv(array_t *a);
void array_free(array_t *a);
array_t *get_array(char *name);
void set_array(char *name, array_t *a);
void unset_array(char *name);

#endif
