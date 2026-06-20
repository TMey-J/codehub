mod converter;
mod ui;

fn main() -> iced::Result {
    ui::ConverterApp::run(iced::Settings::default())
}
