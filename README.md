# YouTube Subtitle Auto Switcher

A Tampermonkey script for auto switching YouTube subtitle to Chinese

The reason why I made this is because there's a lot of Chinese language codes for YouTube subtitles and YouTube can only remember one of them as user selection

## Usage

It will try to switch to Chinese subtitle when you click the caption button (short cut `C` not included) and when the video first loaded

## Known Issues

- Can't auto switch after offline re-online sometimes, onApiChange will not trigger even tho caption module do reloaded
- Can't auto switch embed video's subtitle if they loads another one
