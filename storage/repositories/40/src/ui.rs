use iced::{
    widget::{button, column, row, text, text_input, Space},
    Element, Length, Sandbox, Settings,
};

use crate::converter::{parse_temp, Temperature, Unit};

/// The application state.
#[derive(Default)]
pub struct ConverterApp {
    celsius: String,
    fahrenheit: String,
    kelvin: String,
    error: Option<String>,
    /// Which field was last edited? Used to avoid recursive updates.
    last_edited: Option<Unit>,
}

#[derive(Debug, Clone)]
pub enum Message {
    CelsiusInput(String),
    FahrenheitInput(String),
    KelvinInput(String),
    SwapCelsiusFahrenheit,
    Clear,
}

impl Sandbox for ConverterApp {
    type Message = Message;

    fn new() -> Self {
        Self::default()
    }

    fn title(&self) -> String {
        String::from("🌡️ Temperature Converter")
    }

    fn update(&mut self, message: Message) {
        self.error = None;

        match message {
            Message::CelsiusInput(value) => {
                self.celsius = value;
                self.last_edited = Some(Unit::Celsius);
                self.sync_from(Unit::Celsius);
            }
            Message::FahrenheitInput(value) => {
                self.fahrenheit = value;
                self.last_edited = Some(Unit::Fahrenheit);
                self.sync_from(Unit::Fahrenheit);
            }
            Message::KelvinInput(value) => {
                self.kelvin = value;
                self.last_edited = Some(Unit::Kelvin);
                self.sync_from(Unit::Kelvin);
            }
            Message::SwapCelsiusFahrenheit => {
                std::mem::swap(&mut self.celsius, &mut self.fahrenheit);
                // Recalculate from whichever field now holds the source value.
                // Use Celsius as source after swap if it is non-empty, else Fahrenheit.
                if let Some(c) = parse_temp(&self.celsius) {
                    self.sync_all_from(Unit::Celsius, c);
                } else if let Some(f) = parse_temp(&self.fahrenheit) {
                    self.sync_all_from(Unit::Fahrenheit, f);
                } else {
                    // Both empty: clear Kelvin
                    self.kelvin.clear();
                }
                self.last_edited = None;
            }
            Message::Clear => {
                self.celsius.clear();
                self.fahrenheit.clear();
                self.kelvin.clear();
                self.error = None;
                self.last_edited = None;
            }
        }
    }

    fn view(&self) -> Element<Message> {
        let input_style = |placeholder: &str| {
            text_input(placeholder, "")
                .size(20)
                .padding(10)
        };

        let celsius_input =
            text_input("Celsius", &self.celsius)
                .on_input(Message::CelsiusInput)
                .size(20)
                .padding(10)
                .width(Length::Fixed(200.0));
        let fahrenheit_input =
            text_input("Fahrenheit", &self.fahrenheit)
                .on_input(Message::FahrenheitInput)
                .size(20)
                .padding(10)
                .width(Length::Fixed(200.0));
        let kelvin_input =
            text_input("Kelvin", &self.kelvin)
                .on_input(Message::KelvinInput)
                .size(20)
                .padding(10)
                .width(Length::Fixed(200.0));

        let swap_button = button("🔄 Swap °C / °F")
            .on_press(Message::SwapCelsiusFahrenheit)
            .padding(10);
        let clear_button = button("❌ Clear all")
            .on_press(Message::Clear)
            .padding(10);

        let mut content = column![
            text("🌡️ Temperature Converter").size(32),
            Space::with_height(20),
            row![
                column![text("Celsius:").size(20), celsius_input].spacing(5),
                column![text("Fahrenheit:").size(20), fahrenheit_input].spacing(5),
                column![text("Kelvin:").size(20), kelvin_input].spacing(5),
            ]
            .spacing(20),
            Space::with_height(15),
            row![swap_button, clear_button].spacing(10),
        ]
        .spacing(10)
        .padding(20);

        if let Some(error) = &self.error {
            content = content.push(
                text(error)
                    .size(16)
                    .style(iced::theme::Text::Color(iced::Color::from_rgb(1.0, 0.0, 0.0))),
            );
        }

        iced::widget::container(content)
            .width(Length::Fill)
            .height(Length::Fill)
            .center_x(Length::Fill)
            .center_y(Length::Fill)
            .into()
    }
}

impl ConverterApp {
    /// Recalculate all other fields based on the given source unit.
    fn sync_from(&mut self, source: Unit) {
        let input = match source {
            Unit::Celsius => &self.celsius,
            Unit::Fahrenheit => &self.fahrenheit,
            Unit::Kelvin => &self.kelvin,
        };

        match parse_temp(input) {
            Some(value) => self.sync_all_from(source, value),
            None => {
                // Invalid or empty input: show error only if not empty
                if !input.trim().is_empty() {
                    self.error = Some(format!(
                        "Invalid {} value. Please enter a number.",
                        match source {
                            Unit::Celsius => "Celsius",
                            Unit::Fahrenheit => "Fahrenheit",
                            Unit::Kelvin => "Kelvin",
                        }
                    ));
                }
                // Leave other fields as they were
            }
        }
    }

    /// Update all fields (except the source) to reflect the given value.
    fn sync_all_from(&mut self, source: Unit, value: f64) {
        let temp = Temperature::new(value, source);

        // Update all fields except the source to avoid overwriting user typing.
        if source != Unit::Celsius {
            self.celsius = format!("{:.2}", temp.as_unit(Unit::Celsius));
        }
        if source != Unit::Fahrenheit {
            self.fahrenheit = format!("{:.2}", temp.as_unit(Unit::Fahrenheit));
        }
        if source != Unit::Kelvin {
            self.kelvin = format!("{:.2}", temp.as_unit(Unit::Kelvin));
        }
    }
}

