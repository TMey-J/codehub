#ifndef LINE_GAP_BUFFER_H
#define LINE_GAP_BUFFER_H

#include <string>
#include <vector>

class LineGapBuffer {
public:
    LineGapBuffer();
    void insertLine(size_t pos, const std::string &text = "");
    void deleteLine(size_t pos);
    std::string &line(size_t pos);
    const std::string &line(size_t pos) const;
    size_t lineCount() const;
    size_t charCount() const; // total characters (excluding newlines)
    void insertChar(size_t line, size_t col, char c);
    void deleteChar(size_t line, size_t col);
    void setContent(const std::string &content); // parse lines by '\n'
    std::string getContent() const; // join with '\n'
private:
    std::vector<std::string> lines;
    size_t gapStart;
    size_t gapEnd;
    void reallocate();
};

#endif
