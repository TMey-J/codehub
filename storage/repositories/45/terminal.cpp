#include "terminal.h"
#include <cstdio>
#include <unistd.h>
#include <sys/ioctl.h>

Terminal::Terminal() {
    tcgetattr(STDIN_FILENO, &orig);
    raw = orig;
    raw.c_iflag &= ~(BRKINT | ICRNL | INPCK | ISTRIP | IXON);
    raw.c_oflag &= ~(OPOST);
    raw.c_cflag |= (CS8);
    raw.c_lflag &= ~(ECHO | ICANON | IEXTEN | ISIG);
    raw.c_cc[VMIN] = 0;
    raw.c_cc[VTIME] = 1;
}

Terminal::~Terminal() { disableRaw(); }

void Terminal::enableRaw() { tcsetattr(STDIN_FILENO, TCSAFLUSH, &raw); }
void Terminal::disableRaw() { tcsetattr(STDIN_FILENO, TCSAFLUSH, &orig); }

int Terminal::getKey() {
    char c;
    int n = read(STDIN_FILENO, &c, 1);
    return (n == 1) ? (int)c : -1;
}

void Terminal::getSize(int &rows, int &cols) {
    struct winsize ws;
    if (ioctl(STDOUT_FILENO, TIOCGWINSZ, &ws) == 0) {
        rows = ws.ws_row;
        cols = ws.ws_col;
    } else {
        rows = 24; cols = 80;
    }
}

void Terminal::moveCursor(int row, int col) { printf("\033[%d;%dH", row + 1, col + 1); }
void Terminal::clearScreen() { printf("\033[2J\033[H"); }
void Terminal::hideCursor() { printf("\033[?25l"); }
void Terminal::showCursor() { printf("\033[?25h"); }
void Terminal::clearLine() { printf("\033[2K"); }
