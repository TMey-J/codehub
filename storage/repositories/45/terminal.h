#ifndef TERMINAL_H
#define TERMINAL_H

#include <termios.h>

class Terminal {
public:
    Terminal();
    ~Terminal();
    void enableRaw();
    void disableRaw();
    int getKey();
    void getSize(int &rows, int &cols);
    void moveCursor(int row, int col);
    void clearScreen();
    void hideCursor();
    void showCursor();
    void clearLine();
private:
    struct termios orig, raw;
};

#endif
