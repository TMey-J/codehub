#include "shell.h"
#include <stdlib.h>
#include <ctype.h>

static long long parse_expr(char **s, int *err);
static long long parse_term(char **s, int *err);
static long long parse_factor(char **s, int *err);

long long eval_arith(char *expr, int *err) {
    char *s = expr;
    *err = 0;
    long long result = parse_expr(&s, err);
    if (*err || *s) *err = 1;
    return result;
}

static long long parse_expr(char **s, int *err) {
    long long left = parse_term(s, err);
    while (**s == '+' || **s == '-') {
        char op = **s; (*s)++;
        long long right = parse_term(s, err);
        if (*err) return 0;
        if (op == '+') left += right;
        else left -= right;
    }
    return left;
}

static long long parse_term(char **s, int *err) {
    long long left = parse_factor(s, err);
    while (**s == '*' || **s == '/' || **s == '%') {
        char op = **s; (*s)++;
        long long right = parse_factor(s, err);
        if (*err) return 0;
        if (op == '*') left *= right;
        else if (op == '/') { if (right == 0) { *err = 1; return 0; } left /= right; }
        else { if (right == 0) { *err = 1; return 0; } left %= right; }
    }
    return left;
}

static long long parse_factor(char **s, int *err) {
    while (isspace(**s)) (*s)++;
    if (**s == '(') {
        (*s)++;
        long long val = parse_expr(s, err);
        if (**s == ')') (*s)++;
        else *err = 1;
        return val;
    }
    char *end;
    long long val = strtoll(*s, &end, 0);
    if (end == *s) { *err = 1; return 0; }
    *s = end;
    return val;
}
