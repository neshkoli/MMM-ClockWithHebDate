# MMM-ClockWithHebDate

MMM-ClockWithHebDate is a module for displaying the current time and date alongside the Hebrew date in a clean, minimalist format. This module provides both Gregorian and Hebrew calendar information in a horizontal layout.

## Features

- Displays the current time in digital format with customizable styling
- Shows the current date in the Gregorian calendar
- Displays the corresponding Hebrew date in authentic Hebrew characters
- Multiple Hebrew date format options (full, short, dayOnly)
- Horizontal layout with Hebrew date, regular date, and time from left to right
- Position-aware alignment (right-aligned for top_right position, etc.)
- Clean, focused design without distracting additional elements

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/MMM-ClockWithHebDate.git
   ```

2. Navigate to the module directory:

   ```bash
   cd MMM-ClockWithHebDate
   ```

3. Install the required dependencies:

   ```bash
   npm install
   ```

## Usage

To use the MMM-ClockWithHebDate module, add the following configuration to your main configuration file:

```javascript
{
  module: "MMM-ClockWithHebDate",
  position: "top_right", // Position on the screen
  config: {
    // Time and date display
    showTime: true,
    showDate: true,
    timeFormat: 24,
    dateFormat: "dddd, LL",
    
    // Hebrew date options
    showHebrewDate: true,
    hebrewDateFormat: "full", // options: "full", "short", "dayOnly"
    
    // Other options
    displaySeconds: true
  }
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showTime` | Boolean | `true` | Display the current time |
| `showDate` | Boolean | `true` | Display the current date |
| `timeFormat` | Number | `24` | Time format (12 or 24 hour) |
| `dateFormat` | String | `"dddd, LL"` | Moment.js date format |
| `displaySeconds` | Boolean | `false` | Show seconds in time display |
| `showPeriod` | Boolean | `false` | Show AM/PM indicator (12-hour format only) |
| `showPeriodUpper` | Boolean | `false` | Show AM/PM in uppercase |
| `clockBold` | Boolean | `false` | Make clock text bold |
| `timezone` | String | `null` | Timezone (e.g., "America/New_York") |
| `showHebrewDate` | Boolean | `true` | Display Hebrew date |
| `hebrewDateFormat` | String | `"full"` | Hebrew date format: "full", "short", "dayOnly" |

## Hebrew Date Formats

- **full**: "כ״ו סִיוָן תשפ״ה" (day, month, year in Hebrew)
- **short**: "כ״ו סִיוָן" (day and month only in Hebrew)  
- **dayOnly**: "כ״ו סִיוָן" (same as short)

## GitHub Integration (MCP Service)

This project includes a Model Context Protocol (MCP) service for GitHub integration, making it easy to manage your repository programmatically.

### Quick Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run the interactive setup:**

   ```bash
   npm run init
   ```

   This will guide you through:
   - Setting up your GitHub token
   - Creating a new repository
   - Uploading all project files

### Manual Setup

If you prefer manual setup:

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Get a GitHub Personal Access Token:**
   - Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Select scopes: `repo`, `user`
   - Copy the generated token

3. **Configure environment:**

   ```bash
   cp .env.example .env
   # Edit .env and add your GitHub token
   ```

4. **Quick setup - Create and upload to GitHub:**

   ```bash
   npm run setup-github
   ```

### Available MCP Tools

The GitHub MCP server provides these tools:

- **create_repository**: Create a new GitHub repository
- **upload_files**: Upload files to a repository
- **get_user**: Get authenticated user information
- **list_repositories**: List your repositories

### Manual MCP Usage

You can also run the MCP server directly:

```bash
npm run mcp
```

Or use the individual tools programmatically in your MCP-compatible applications.

## Customization

You can customize the appearance of the clock by modifying the `MMM-ClockWithHebDate.css` file. Adjust styles such as font size, colors, and layout to match your preferences.

## Contributing

Contributions are welcome! If you have suggestions or improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
