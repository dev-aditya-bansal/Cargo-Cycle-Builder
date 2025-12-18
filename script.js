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

// Currently selected part name
let currentPartName = '';

// Part options mapping - each part has 2 options (1 and 2)
const partOptions = {
    'frame': ['Frame 1', 'Frame 2'],
    'handle': ['Handle 1', 'Handle 2'],
    'frontWheel': ['Wheel 1', 'Wheel 2'],
    'backWheel': ['Wheel 1', 'Wheel 2'],
    'cargoBox': ['Cargo Box 1', 'Cargo Box 2'],
    'seat': ['Seat 1', 'Seat 2'],
    'pedal': ['Pedal 1', 'Pedal 2']
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    setupSelectListeners();
    initializeCustomDropdowns();
});

// Initialize custom dropdowns
function initializeCustomDropdowns() {
    // Initialize part name dropdown
    const partNameCustom = document.getElementById('partNameSelectCustom');
    const partNameSelect = document.getElementById('partNameSelect');
    
    if (partNameCustom) {
        setupCustomDropdown(partNameCustom, partNameSelect, handlePartNameChange);
    }
    
    // Initialize part option dropdown
    const partOptionCustom = document.getElementById('partOptionSelectCustom');
    const partOptionSelect = document.getElementById('partOptionSelect');
    
    if (partOptionCustom) {
        setupCustomDropdown(partOptionCustom, partOptionSelect, handlePartOptionChange);
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.custom-select')) {
            document.querySelectorAll('.custom-select').forEach(dropdown => {
                dropdown.classList.remove('active');
                dropdown.style.zIndex = '';
                // Remove active class from parent
                const menuControlGroup = dropdown.closest('.menu-control-group');
                if (menuControlGroup) {
                    menuControlGroup.classList.remove('has-active-dropdown');
                }
            });
        }
    });
}

// Setup a custom dropdown
function setupCustomDropdown(customSelect, hiddenSelect, onChangeCallback) {
    const trigger = customSelect.querySelector('.custom-select-trigger');
    const optionsContainer = customSelect.querySelector('.custom-select-options');
    const valueSpan = trigger.querySelector('.custom-select-value');
    
    // Remove existing event listeners by cloning (clean slate)
    const newTrigger = trigger.cloneNode(true);
    trigger.parentNode.replaceChild(newTrigger, trigger);
    const newValueSpan = newTrigger.querySelector('.custom-select-value');
    
    // Toggle dropdown on trigger click
    newTrigger.addEventListener('click', function(e) {
        if (newTrigger.classList.contains('disabled')) return;
        
        e.stopPropagation();
        const isActive = customSelect.classList.contains('active');
        
        // Close all other dropdowns first
        document.querySelectorAll('.custom-select').forEach(dd => {
            if (dd !== customSelect) {
                dd.classList.remove('active');
                dd.style.zIndex = '';
                // Remove active class from parent
                const menuControlGroup = dd.closest('.menu-control-group');
                if (menuControlGroup) {
                    menuControlGroup.classList.remove('has-active-dropdown');
                }
            }
        });
        
        // Toggle this dropdown
        if (!isActive) {
            // Set very high z-index when opening
            customSelect.style.zIndex = '1000000';
            customSelect.classList.add('active');
            // Add class to parent menu-control-group
            const menuControlGroup = customSelect.closest('.menu-control-group');
            if (menuControlGroup) {
                menuControlGroup.classList.add('has-active-dropdown');
            }
        } else {
            customSelect.style.zIndex = '';
            customSelect.classList.remove('active');
            // Remove class from parent menu-control-group
            const menuControlGroup = customSelect.closest('.menu-control-group');
            if (menuControlGroup) {
                menuControlGroup.classList.remove('has-active-dropdown');
            }
        }
    });
    
    // Handle option selection - use event delegation
    optionsContainer.addEventListener('click', function(e) {
        const option = e.target.closest('.custom-select-option');
        if (!option) return;
        
        e.stopPropagation();
        const value = option.getAttribute('data-value');
        const text = option.textContent;
        
        // Update display
        newValueSpan.textContent = text;
        
        // Update hidden select
        hiddenSelect.value = value;
        
        // Update selected state
        optionsContainer.querySelectorAll('.custom-select-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        option.classList.add('selected');
        
        // Close dropdown
        customSelect.classList.remove('active');
        customSelect.style.zIndex = '';
        // Remove active class from parent
        const menuControlGroup = customSelect.closest('.menu-control-group');
        if (menuControlGroup) {
            menuControlGroup.classList.remove('has-active-dropdown');
        }
        
        // Trigger change event on hidden select
        const changeEvent = new Event('change', { bubbles: true });
        hiddenSelect.dispatchEvent(changeEvent);
        
        // Call the callback if provided
        if (onChangeCallback) {
            onChangeCallback();
        }
    });
    
    // Sync with hidden select changes
    const syncSelect = function() {
        const selectedValue = hiddenSelect.value;
        const options = optionsContainer.querySelectorAll('.custom-select-option');
        const selectedOption = Array.from(options).find(opt => opt.getAttribute('data-value') === selectedValue);
        
        if (selectedOption) {
            newValueSpan.textContent = selectedOption.textContent;
            options.forEach(opt => opt.classList.remove('selected'));
            selectedOption.classList.add('selected');
        } else if (selectedValue === '') {
            // Reset to placeholder if value is empty
            const placeholder = customSelect.id === 'partNameSelectCustom' ? 'Select Part Name' : 'Select Part Option';
            newValueSpan.textContent = placeholder;
            options.forEach(opt => opt.classList.remove('selected'));
        }
    };
    
    hiddenSelect.addEventListener('change', syncSelect);
    
    // Handle disabled state
    if (hiddenSelect.disabled) {
        newTrigger.classList.add('disabled');
    } else {
        newTrigger.classList.remove('disabled');
    }
    
    // Initial sync
    syncSelect();
}

// Handle part name selection
function handlePartNameChange() {
    const partNameSelect = document.getElementById('partNameSelect');
    const partOptionSelect = document.getElementById('partOptionSelect');
    const partOptionCustom = document.getElementById('partOptionSelectCustom');
    const selectedPartName = partNameSelect.value;
    
    // Reset part option dropdown
    partOptionSelect.innerHTML = '<option value=""></option>';
    partOptionSelect.value = '';
    partOptionSelect.disabled = true;
    
    // Update custom dropdown
    if (partOptionCustom) {
        const optionsContainer = partOptionCustom.querySelector('.custom-select-options');
        const trigger = partOptionCustom.querySelector('.custom-select-trigger');
        const valueSpan = trigger.querySelector('.custom-select-value');
        
        optionsContainer.innerHTML = '';
        trigger.classList.add('disabled');
        valueSpan.textContent = 'Select Part Name First';
    }
    
    if (selectedPartName && partOptions[selectedPartName]) {
        // Enable the part option dropdown
        partOptionSelect.disabled = false;
        currentPartName = selectedPartName;
        
        // Populate options in hidden select
        partOptions[selectedPartName].forEach((option, index) => {
            const optionElement = document.createElement('option');
            optionElement.value = (index + 1).toString(); // 1 or 2
            optionElement.textContent = option;
            partOptionSelect.appendChild(optionElement);
        });
        
        // Populate options in custom dropdown
        if (partOptionCustom) {
            const optionsContainer = partOptionCustom.querySelector('.custom-select-options');
            
            optionsContainer.innerHTML = '';
            
            partOptions[selectedPartName].forEach((option, index) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'custom-select-option';
                optionDiv.setAttribute('data-value', (index + 1).toString());
                optionDiv.textContent = option;
                optionsContainer.appendChild(optionDiv);
            });
            
            // Re-initialize the custom dropdown options
            setupCustomDropdown(partOptionCustom, partOptionSelect, handlePartOptionChange);
            
            // Update trigger after re-initialization
            const trigger = partOptionCustom.querySelector('.custom-select-trigger');
            const valueSpan = trigger.querySelector('.custom-select-value');
            trigger.classList.remove('disabled');
            valueSpan.textContent = 'Select Part Option';
        }
        
        // Add animation to menu control group
        const menuControlGroup = partNameSelect.closest('.menu-control-group');
        if (menuControlGroup) {
            menuControlGroup.classList.add('active');
            setTimeout(() => menuControlGroup.classList.remove('active'), 500);
        }
    } else {
        currentPartName = '';
    }
}

// Handle part option selection
function handlePartOptionChange() {
    const partOptionSelect = document.getElementById('partOptionSelect');
    const selectedOption = partOptionSelect.value;
    
    if (currentPartName && selectedOption) {
        // Update the part with the selected option
        updatePart(currentPartName, selectedOption);
        
        // Add animation to menu control group
        const menuControlGroup = partOptionSelect.closest('.menu-control-group');
        if (menuControlGroup) {
            menuControlGroup.classList.add('active');
            setTimeout(() => menuControlGroup.classList.remove('active'), 500);
        }
    }
}

// Function to update part image based on selection
function updatePart(partId, color) {
    const imgElement = document.getElementById(partId);
    const placeholderText = document.querySelector('.placeholder-text');
    const controlGroup = document.querySelector(`#${partId}Color`)?.closest('.control-group');
    const menuControlGroup = document.querySelector('.menu-control-group');
    
    // Add active class to control group for animation
    if (controlGroup) {
        controlGroup.classList.add('active');
        setTimeout(() => controlGroup.classList.remove('active'), 500);
    }
    
    // Add animation to menu control group if exists
    if (menuControlGroup) {
        menuControlGroup.classList.add('active');
        setTimeout(() => menuControlGroup.classList.remove('active'), 500);
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
    
    // Add stagger animation to menu control groups
    const menuControlGroups = document.querySelectorAll('.menu-control-group');
    menuControlGroups.forEach((group, index) => {
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
            const menuControlGroup = this.closest('.menu-control-group');
            
            if (controlGroup) {
                controlGroup.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    controlGroup.style.transform = '';
                }, 200);
            }
            
            if (menuControlGroup) {
                menuControlGroup.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    menuControlGroup.style.transform = '';
                }, 200);
            }
        });
        
        // Add focus animation
        select.addEventListener('focus', function() {
            const parent = this.parentElement;
            if (parent) {
                parent.style.transform = 'translateX(5px)';
            }
        });
        
        select.addEventListener('blur', function() {
            const parent = this.parentElement;
            if (parent) {
                parent.style.transform = '';
            }
        });
    });
}

