#include "shell.h"

char *get_env_var(const char *name) {
    return getenv(name);
}

void set_env_var(const char *name, const char *value) {
    setenv(name, value, 1);
}

void unset_env_var(const char *name) {
    unsetenv(name);
}
