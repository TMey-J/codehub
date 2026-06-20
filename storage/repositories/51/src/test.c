#include "shell.h"

int test_expression(char **args) {
    if (!args[0]) return 1;
    if (strcmp(args[0], "-d") == 0 && args[1]) {
        struct stat st;
        return !(stat(args[1], &st) == 0 && S_ISDIR(st.st_mode));
    }
    if (strcmp(args[0], "-f") == 0 && args[1]) {
        struct stat st;
        return !(stat(args[1], &st) == 0 && S_ISREG(st.st_mode));
    }
    if (strcmp(args[0], "-z") == 0 && args[1]) {
        return !(strlen(args[1]) == 0);
    }
    if (strcmp(args[0], "-n") == 0 && args[1]) {
        return !(strlen(args[1]) > 0);
    }
    if (args[1] && (strcmp(args[1], "=") == 0 || strcmp(args[1], "==") == 0)) {
        return !(strcmp(args[0], args[2]) == 0);
    }
    if (args[1] && strcmp(args[1], "!=") == 0) {
        return !(strcmp(args[0], args[2]) != 0);
    }
    // default: false (1)
    return 1;
}
