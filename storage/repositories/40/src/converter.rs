/// Supported temperature units
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Unit {
    Celsius,
    Fahrenheit,
    Kelvin,
}

/// Holds a temperature value and provides conversions.
/// This struct is the single source of truth.
#[derive(Debug, Clone, Copy)]
pub struct Temperature {
    /// Internally always stored as Kelvin for consistency.
    kelvin: f64,
}

impl Temperature {
    /// Create a new temperature from the given value and unit.
    pub fn new(value: f64, unit: Unit) -> Self {
        let kelvin = match unit {
            Unit::Celsius => value + 273.15,
            Unit::Fahrenheit => (value + 459.67) * 5.0 / 9.0,
            Unit::Kelvin => value,
        };
        Self { kelvin }
    }

    /// Get the temperature in the requested unit.
    pub fn as_unit(&self, unit: Unit) -> f64 {
        match unit {
            Unit::Celsius => self.kelvin - 273.15,
            Unit::Fahrenheit => self.kelvin * 9.0 / 5.0 - 459.67,
            Unit::Kelvin => self.kelvin,
        }
    }

    /// Update the internal value by specifying a new value in a given unit.
    pub fn set_from(&mut self, value: f64, unit: Unit) {
        *self = Temperature::new(value, unit);
    }
}

/// Helper to parse a trimmed string into a f64, returning None on failure.
pub fn parse_temp(s: &str) -> Option<f64> {
    s.trim().parse().ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_conversion_accuracy() {
        let t = Temperature::new(0.0, Unit::Celsius);
        assert!((t.as_unit(Unit::Fahrenheit) - 32.0).abs() < 0.01);
        assert!((t.as_unit(Unit::Kelvin) - 273.15).abs() < 0.01);

        let t = Temperature::new(100.0, Unit::Fahrenheit);
        assert!((t.as_unit(Unit::Celsius) - 37.7778).abs() < 0.01);
    }
}
