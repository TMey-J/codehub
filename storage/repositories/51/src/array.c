#include "shell.h"

array_entry_t *array_entries = NULL;
int array_entry_count = 0;

void array_init(array_t *a) {
    a->items = NULL;
    a->len = 0;
    a->cap = 0;
}

void array_add(array_t *a, char *item) {
    if (a->len >= a->cap) {
        a->cap = a->cap ? a->cap * 2 : 4;
        a->items = realloc(a->items, a->cap * sizeof(char *));
    }
    a->items[a->len++] = strdup(item);
}

char **array_to_argv(array_t *a) {
    char **argv = malloc((a->len + 1) * sizeof(char *));
    for (int i = 0; i < a->len; i++) argv[i] = strdup(a->items[i]);
    argv[a->len] = NULL;
    return argv;
}

void array_free(array_t *a) {
    for (int i = 0; i < a->len; i++) free(a->items[i]);
    free(a->items);
    a->len = a->cap = 0;
    a->items = NULL;
}

array_t *get_array(char *name) {
    for (int i = 0; i < array_entry_count; i++) {
        if (strcmp(array_entries[i].name, name) == 0) return &array_entries[i].data;
    }
    return NULL;
}

void set_array(char *name, array_t *a) {
    for (int i = 0; i < array_entry_count; i++) {
        if (strcmp(array_entries[i].name, name) == 0) {
            array_free(&array_entries[i].data);
            array_entries[i].data = *a;
            return;
        }
    }
    array_entries = realloc(array_entries, (array_entry_count + 1) * sizeof(array_entry_t));
    array_entries[array_entry_count].name = strdup(name);
    array_entries[array_entry_count].data = *a;
    array_entry_count++;
}

void unset_array(char *name) {
    for (int i = 0; i < array_entry_count; i++) {
        if (strcmp(array_entries[i].name, name) == 0) {
            free(array_entries[i].name);
            array_free(&array_entries[i].data);
            for (int j = i; j < array_entry_count - 1; j++) array_entries[j] = array_entries[j+1];
            array_entry_count--;
            return;
        }
    }
}
