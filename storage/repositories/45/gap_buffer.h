#ifndef GAP_BUFFER_H
#define GAP_BUFFER_H

#include <string>
#include <vector>

class GapBuffer {
public:
    GapBuffer();
    void insert(char c);
    void erase();
    void deleteChar();
    void moveLeft();
    void moveRight();
    void moveUp(int cols);
    void moveDown(int cols);
    std::string content() const;
    void setContent(const std::string &text);
    size_t size() const;
    size_t pos() const;
private:
    std::vector<char> buffer;
    size_t cursor;
    size_t gapStart;
    size_t gapEnd;
};

#endif
