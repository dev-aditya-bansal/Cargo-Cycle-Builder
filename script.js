// Part name mapping
const partNames = {
    'frame': 'Frame',
    'handle': 'Handle',
    'frontWheel': 'Wheel',  // Use same wheel image for front
    'backWheel': 'Wheel',   // Use same wheel image for back
    'cargoBox': 'Cargo Box',
    'seat': 'Seat',
    'pedal': 'pedal'  // Lowercase to match file names (pedal1.png, pedal2.png)
};

// Part display names for notifications
const partDisplayNames = {
    'frame': 'Frame',
    'handle': 'Handle',
    'frontWheel': 'Front Wheel',
    'backWheel': 'Back Wheel',
    'cargoBox': 'Cargo Box',
    'seat': 'Seat',
    'pedal': 'Pedal'
};

// Track if any image has successfully loaded
let hasLoadedImage = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    setupSelectListeners();
});

// Function to update part image based on selection
function updatePart(partId, color) {
    const imgElement = document.getElementById(partId);
    const placeholderText = document.querySelector('.placeholder-text');
    const controlGroup = document.querySelector(`#${partId}Color`)?.closest('.control-group');
    
    // Add active class to control group for animation
    if (controlGroup) {
        controlGroup.classList.add('active');
        setTimeout(() => controlGroup.classList.remove('active'), 500);
    }
    
    if (!color || color === '') {
        // Hide image if no color selected
        imgElement.classList.remove('loaded', 'loading');
        imgElement.style.display = 'none';
        // Show placeholder if no images are visible
        checkAndShowPlaceholder();
        return;
    }

    // Construct image path: images/partnamenumber.png or .jpeg
    // Example: images/Frame1.png, images/Wheel1.png (no underscore)
    const partName = partNames[partId];
    
    // Try .png first, then .jpeg if .png fails
    const imagePathPng = `images/${partName}${color}.png`;
    const imagePathJpeg = `images/${partName}${color}.jpeg`;
    
    // Show loading state
    imgElement.classList.remove('loaded', 'updating');
    imgElement.classList.add('loading');
    imgElement.style.display = 'block';
    
    // Show spinner if this is the first image
    if (!hasLoadedImage) {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) spinner.classList.add('active');
    }
    
    // Set image source - try .png first
    imgElement.src = imagePathPng;
    
    // Handle successful image load
    imgElement.onload = function() {
        hasLoadedImage = true;
        this.classList.remove('loading');
        this.classList.add('loaded');
        
        // Hide spinner
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) spinner.classList.remove('active');
        
        // Add update animation
        this.classList.add('updating');
        setTimeout(() => this.classList.remove('updating'), 400);
        
        if (placeholderText) {
            placeholderText.style.display = 'none';
        }
        
        // Show success notification
        showNotification(`${partDisplayNames[partId]} updated!`);
    };
    
    // Handle image load error - try .jpeg if .png fails
    imgElement.onerror = function() {
        // Check if we already tried .jpeg (by checking if current src is .jpeg)
        if (this.src.includes('.png')) {
            // Try .jpeg extension
            this.src = imagePathJpeg;
        } else {
            // Both .png and .jpeg failed
            console.warn(`Image not found: ${partName}${color}.png or .jpeg`);
            this.classList.remove('loading', 'loaded');
            this.style.display = 'none';
            // Show placeholder if no images are visible
            checkAndShowPlaceholder();
            showNotification(`Image not found: ${partName}_${color}`, 'error');
        }
    };
}

// Function to check if any images are visible and show placeholder if needed
function checkAndShowPlaceholder() {
    const placeholderText = document.querySelector('.placeholder-text');
    if (!placeholderText) return;
    
    const partImages = document.querySelectorAll('.part-image');
    let anyVisible = false;
    
    partImages.forEach(img => {
        if (img.style.display !== 'none' && img.classList.contains('loaded')) {
            anyVisible = true;
        }
    });
    
    if (!anyVisible && !hasLoadedImage) {
        placeholderText.style.display = 'block';
    } else if (anyVisible) {
        placeholderText.style.display = 'none';
    }
}

// Function to show notification
function showNotification(message, type = 'success') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.background = type === 'error' ? '#f44336' : '#4CAF50';
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after animation
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Initialize animations
function initializeAnimations() {
    // Add stagger animation to control groups
    const controlGroups = document.querySelectorAll('.control-group');
    controlGroups.forEach((group, index) => {
        group.style.animationDelay = `${index * 0.1}s`;
    });
}

// Setup select listeners for better interactivity
function setupSelectListeners() {
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.addEventListener('change', function() {
            // Add ripple effect
            const controlGroup = this.closest('.control-group');
            if (controlGroup) {
                controlGroup.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    controlGroup.style.transform = '';
                }, 200);
            }
        });
        
        // Add focus animation
        select.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateX(5px)';
        });
        
        select.addEventListener('blur', function() {
            this.parentElement.style.transform = '';
        });
    });
}

