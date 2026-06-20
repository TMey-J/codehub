#include "shell.h"

job_t *job_list = NULL;
int job_count = 0;

void add_job(pid_t pgid, char *cmdline, int bg) {
    job_t *new = malloc(sizeof(job_t));
    new->jid = 1;
    while (find_job(new->jid)) new->jid++;
    new->pgid = pgid;
    new->cmdline = strdup(cmdline);
    new->state = bg ? JOB_RUNNING : JOB_STOPPED;
    new->foreground = !bg;
    new->pids = NULL;
    new->num_pids = 0;
    new->next = job_list;
    job_list = new;
    job_count++;
    if (bg) printf("[%d] %d\n", new->jid, pgid);
}

void remove_job(int jid) {
    job_t *prev = NULL, *cur = job_list;
    while (cur) {
        if (cur->jid == jid) {
            free(cur->cmdline);
            free(cur->pids);
            if (prev) prev->next = cur->next;
            else job_list = cur->next;
            free(cur);
            job_count--;
            return;
        }
        prev = cur;
        cur = cur->next;
    }
}

job_t *find_job(int jid) {
    job_t *cur = job_list;
    while (cur) {
        if (cur->jid == jid) return cur;
        cur = cur->next;
    }
    return NULL;
}

void update_job_status(void) {
    job_t *cur = job_list;
    while (cur) {
        int status;
        pid_t pid = waitpid(-cur->pgid, &status, WNOHANG | WUNTRACED | WCONTINUED);
        if (pid > 0) {
            if (WIFEXITED(status) || WIFSIGNALED(status)) cur->state = JOB_TERMINATED;
            else if (WIFSTOPPED(status)) cur->state = JOB_STOPPED;
            else if (WIFCONTINUED(status)) cur->state = JOB_RUNNING;
        }
        cur = cur->next;
    }
    cur = job_list;
    while (cur) {
        job_t *next = cur->next;
        if (cur->state == JOB_TERMINATED) remove_job(cur->jid);
        cur = next;
    }
}

void list_jobs(void) {
    update_job_status();
    job_t *cur = job_list;
    while (cur) {
        char *state_str = (cur->state == JOB_RUNNING) ? "Running" : "Stopped";
        printf("[%d] %s %s\n", cur->jid, state_str, cur->cmdline);
        cur = cur->next;
    }
}

void fg_job(int jid) {
    update_job_status();
    job_t *j = find_job(jid);
    if (!j) { fprintf(stderr, "fg: job not found\n"); return; }
    tcsetpgrp(STDIN_FILENO, j->pgid);
    kill(-j->pgid, SIGCONT);
    int status;
    waitpid(-j->pgid, &status, WUNTRACED);
    tcsetpgrp(STDIN_FILENO, getpgrp());
    if (WIFSTOPPED(status)) j->state = JOB_STOPPED;
    else remove_job(j->jid);
}

void bg_job(int jid) {
    update_job_status();
    job_t *j = find_job(jid);
    if (!j) { fprintf(stderr, "bg: job not found\n"); return; }
    kill(-j->pgid, SIGCONT);
    j->state = JOB_RUNNING;
    printf("[%d] %s &\n", j->jid, j->cmdline);
}
