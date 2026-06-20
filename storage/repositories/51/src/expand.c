#include "shell.h"

char *expand_tilde(char *str) {
    if (!str || str[0] != '~') return strdup(str);
    char *home = getenv("HOME");
    if (!home) return strdup(str);
    if (str[1] == '/' || str[1] == '\0') {
        char *result = malloc(strlen(home) + strlen(str + 1) + 1);
        sprintf(result, "%s%s", home, str + 1);
        return result;
    }
    return strdup(str);
}

char *expand_brace(char *arg) {
    char *open = strchr(arg, '{');
    if (!open) return strdup(arg);
    char *close = strchr(open, '}');
    if (!close) return strdup(arg);
    if (strchr(open, ',')) {
        char *start = open + 1;
        char *end = close;
        *end = '\0';
        char *p = start;
        char *last = start;
        char *result = malloc(1);
        result[0] = '\0';
        int first = 1;
        while (p <= end) {
            if (*p == ',' || p == end) {
                int len = (p == end) ? (p - last) : (p - last);
                char part[len + 1];
                strncpy(part, last, len);
                part[len] = '\0';
                char *prefix = strdup(arg);
                char *suffix = strdup(close + 1);
                prefix[open - arg] = '\0';
                char *new = malloc(strlen(prefix) + strlen(part) + strlen(suffix) + 1);
                sprintf(new, "%s%s%s", prefix, part, suffix);
                if (!first) {
                    result = realloc(result, strlen(result) + strlen(new) + 2);
                    strcat(result, " ");
                }
                strcat(result, new);
                free(new);
                free(prefix);
                free(suffix);
                first = 0;
                last = p + 1;
            }
            p++;
        }
        free(arg);
        return result;
    }
    if (strstr(open, "..")) {
        char *dots = strstr(open, "..");
        char *start_str = open + 1;
        char *end_str = dots + 2;
        char *endp = close;
        *endp = '\0';
        long long start = strtoll(start_str, NULL, 10);
        long long end = strtoll(end_str, NULL, 10);
        char *prefix = strdup(arg);
        prefix[open - arg] = '\0';
        char *suffix = strdup(close + 1);
        char *result = malloc(1);
        result[0] = '\0';
        long long step = (start < end) ? 1 : -1;
        long long i = start;
        int first = 1;
        while ((step > 0 && i <= end) || (step < 0 && i >= end)) {
            char num[32];
            sprintf(num, "%lld", i);
            char *new = malloc(strlen(prefix) + strlen(num) + strlen(suffix) + 1);
            sprintf(new, "%s%s%s", prefix, num, suffix);
            if (!first) {
                result = realloc(result, strlen(result) + strlen(new) + 2);
                strcat(result, " ");
            }
            strcat(result, new);
            free(new);
            first = 0;
            i += step;
        }
        free(prefix);
        free(suffix);
        free(arg);
        return result;
    }
    return arg;
}

char *expand_parameter(char *arg, int *status) {
    if (arg[0] != '$' || arg[1] != '{') return NULL;
    char *p = arg + 2;
    char *end = strchr(p, '}');
    if (!end) return NULL;
    *end = '\0';
    char *name = p;
    char *colon = strchr(p, ':');
    char *op = NULL;
    char *value = NULL;
    if (colon) {
        *colon = '\0';
        op = colon + 1;
        if (*op == '-') { op++; value = op; }
        else if (*op == '=') { op++; value = op; }
        else if (*op == '+') { op++; value = op; }
        else if (*op == '?') { op++; value = op; }
        else if (*op == '/') { op++; value = op; }
    }
    char *env = getenv(name);
    char *result = NULL;
    if (op && *op == '-') {
        result = env ? strdup(env) : strdup(value);
    } else if (op && *op == '=') {
        if (!env) {
            setenv(name, value, 1);
            result = strdup(value);
        } else result = strdup(env);
    } else if (op && *op == '+') {
        result = env ? strdup(value) : strdup("");
    } else if (op && *op == '?') {
        if (!env) {
            fprintf(stderr, "%s: %s\n", name, value);
            *status = 1;
            result = strdup("");
        } else result = strdup(env);
    } else if (op && *op == '/') {
        // simple replacement: ${var/pattern/replacement} – skip for brevity
        result = env ? strdup(env) : strdup("");
    } else {
        if (name[0] == '#') {
            char *vname = name + 1;
            char *val = getenv(vname);
            if (val) {
                result = malloc(20);
                sprintf(result, "%zu", strlen(val));
            } else {
                result = strdup("0");
            }
        } else {
            result = env ? strdup(env) : strdup("");
        }
    }
    *end = '}';
    char *new_arg = malloc(strlen(arg) + 1);
    strcpy(new_arg, arg);
    char *start = strstr(new_arg, "${");
    if (start) {
        char *before = strdup(new_arg);
        before[start - new_arg] = '\0';
        char *after = strdup(end + 1);
        char *final = malloc(strlen(before) + strlen(result) + strlen(after) + 1);
        sprintf(final, "%s%s%s", before, result, after);
        free(before); free(after); free(new_arg);
        free(result);
        return final;
    }
    free(new_arg);
    free(result);
    return NULL;
}

char *expand_string(char *str) {
    if (!str) return NULL;
    // brace expansion first
    char *braced = expand_brace(str);
    char *expanded = NULL;
    if (strcmp(braced, str) != 0) {
        char *space = strchr(braced, ' ');
        if (space) *space = '\0';
        expanded = strdup(braced);
        free(braced);
    } else {
        expanded = strdup(str);
        free(braced);
    }

    // arithmetic $((...))
    char *start = strstr(expanded, "$((");
    while (start) {
        char *end = strstr(start + 3, "))");
        if (!end) break;
        *end = '\0';
        char *expr = start + 3;
        int err;
        long long val = eval_arith(expr, &err);
        if (err) { fprintf(stderr, "arithmetic error\n"); return expanded; }
        char valstr[32];
        sprintf(valstr, "%lld", val);
        char *new = malloc(strlen(expanded) + strlen(valstr) + 1);
        int prefix_len = start - expanded;
        strncpy(new, expanded, prefix_len);
        new[prefix_len] = '\0';
        strcat(new, valstr);
        strcat(new, end + 2);
        free(expanded);
        expanded = new;
        start = strstr(expanded, "$((");
    }

    // parameter expansion ${...}
    start = strstr(expanded, "${");
    while (start) {
        char *end = strchr(start, '}');
        if (!end) break;
        int status = 0;
        char *result = expand_parameter(start, &status);
        if (status) { free(expanded); return NULL; }
        if (result) {
            char *new = malloc(strlen(expanded) + strlen(result) + 1);
            int prefix_len = start - expanded;
            strncpy(new, expanded, prefix_len);
            new[prefix_len] = '\0';
            strcat(new, result);
            strcat(new, end + 1);
            free(expanded);
            expanded = new;
            free(result);
        }
        start = strstr(expanded, "${");
    }

    // tilde
    char *tilde = expand_tilde(expanded);
    free(expanded);
    return tilde;
}

char **glob_expand(char **args) {
    char **new_args = malloc(MAX_ARGS * sizeof(char *));
    int idx = 0;
    glob_t globbuf;
    for (int i = 0; args[i]; i++) {
        int has_glob = (strchr(args[i], '*') || strchr(args[i], '?') || strchr(args[i], '['));
        if (has_glob) {
            globbuf.gl_offs = 0;
            if (glob(args[i], GLOB_NOCHECK | GLOB_TILDE, NULL, &globbuf) == 0) {
                for (size_t j = 0; j < globbuf.gl_pathc && idx < MAX_ARGS - 1; j++)
                    new_args[idx++] = strdup(globbuf.gl_pathv[j]);
                globfree(&globbuf);
            } else {
                new_args[idx++] = strdup(args[i]);
            }
        } else {
            new_args[idx++] = strdup(args[i]);
        }
    }
    new_args[idx] = NULL;
    return new_args;
}

char **expand_args(char **args) {
    char **expanded = malloc(MAX_ARGS * sizeof(char *));
    int idx = 0;
    for (int i = 0; args[i] && idx < MAX_ARGS - 1; i++) {
        char *exp = expand_string(args[i]);
        if (exp) {
            expanded[idx++] = exp;
        }
    }
    expanded[idx] = NULL;
    char **globbed = glob_expand(expanded);
    for (int i = 0; expanded[i]; i++) free(expanded[i]);
    free(expanded);
    return globbed;
}
