#include "shell.h"

alias_t *alias_list = NULL;

void alias_add(char *name, char *value) {
    alias_t *a = alias_list;
    while (a) {
        if (strcmp(a->name, name) == 0) {
            free(a->value);
            a->value = strdup(value);
            return;
        }
        a = a->next;
    }
    alias_t *new = malloc(sizeof(alias_t));
    new->name = strdup(name);
    new->value = strdup(value);
    new->next = alias_list;
    alias_list = new;
}

char *alias_get(char *name) {
    alias_t *a = alias_list;
    while (a) {
        if (strcmp(a->name, name) == 0) return a->value;
        a = a->next;
    }
    return NULL;
}

void alias_load_from_file(FILE *fp) {
    char *line = NULL;
    size_t n = 0;
    while (getline(&line, &n, fp) != -1) {
        if (line[0] == '#' || line[0] == '\n') continue;
        char *eq = strchr(line, '=');
        if (eq) {
            *eq = '\0';
            char *name = line;
            char *value = eq + 1;
            while (isspace(*name)) name++;
            char *end = name + strlen(name) - 1;
            while (end > name && isspace(*end)) *end-- = '\0';
            while (isspace(*value)) value++;
            end = value + strlen(value) - 1;
            while (end > value && isspace(*end)) *end-- = '\0';
            alias_add(name, value);
        }
    }
    free(line);
}

void alias_save_to_file(FILE *fp) {
    alias_t *a = alias_list;
    while (a) {
        fprintf(fp, "%s=%s\n", a->name, a->value);
        a = a->next;
    }
}

void alias_free_all(void) {
    alias_t *a = alias_list;
    while (a) {
        alias_t *next = a->next;
        free(a->name);
        free(a->value);
        free(a);
        a = next;
    }
    alias_list = NULL;
}
