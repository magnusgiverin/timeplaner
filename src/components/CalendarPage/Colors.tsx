export const generateColor = (numEvents: number): Record<number, string> => {
    const tailwindColorClasses = [
        'bg-red-400',
        'bg-indigo-500',
        'bg-sky-500',
        'bg-teal-400',
        'bg-purple-400',
        'bg-orange-400',
        'bg-yellow-400',
        'bg-lime-500',
        'bg-pink-500',
        'bg-rose-500',
        // Add more colors as needed
    ];

    const resultColors: Record<number, string> = {};
    const usedColors = new Set<string>();

    for (let i = 0; i < numEvents; i++) {
        const titleIndex = i % tailwindColorClasses.length;
        const selectedColor = getRgbFromTailwindColor(tailwindColorClasses[titleIndex]!);
    
        // Check if the color is already used, if yes, pick a new color
        if (usedColors.has(selectedColor)) {
            for (let j = 1; j <= tailwindColorClasses.length; j++) {
                const newIndex = (titleIndex + j) % tailwindColorClasses.length;
                const newColor = getRgbFromTailwindColor(tailwindColorClasses[newIndex]!);
    
                if (!usedColors.has(newColor)) {
                    resultColors[i] = newColor;
                    usedColors.add(newColor);
                    break;
                }
            }
        } else {
            resultColors[i] = selectedColor;
            usedColors.add(selectedColor);
        }
    }

    return resultColors;
};

const getRgbFromTailwindColor = (tailwindColorClass: string) => {
    // Create a temporary div to apply the Tailwind class
    const tempDiv = document.createElement('div');
    tempDiv.className = tailwindColorClass;

    // Append the div to the body to ensure styles are applied
    document.body.appendChild(tempDiv);

    // Get the computed color value
    const computedColor = window.getComputedStyle(tempDiv).backgroundColor;

    // Remove the temporary div from the DOM
    document.body.removeChild(tempDiv);

    return computedColor;
};

// Function to set contrast based on brightness
export const setContrast = (color: string): string => {
    // Extract RGB values from the color string
    const match = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

    if (!match) {
        // Return a default color if the format is not as expected
        return 'black';
    }

    // Extract RGB values from the matched groups
    const [, r, g, b] = match.map(Number) as [string, number, number, number];

    // Calculate brightness based on RGB values
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

    // Set text color based on brightness
    const textColour = brightness > 160 ? 'black' : 'white';

    return textColour;
};
