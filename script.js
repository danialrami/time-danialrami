// Enhanced Temporal Engine with 12h/24h hour logic
class TemporalEngine {
    constructor() {
        this.startTime = performance.now();
        this.lastUpdateTime = this.startTime;
        this.timeOffset = 0;
        this.timezone = this.detectTimezone();
        this.updateTimezoneDisplay();
    }

    detectTimezone() {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch (e) {
            console.warn('Timezone detection failed, falling back to UTC');
            return 'UTC';
        }
    }

    updateTimezoneDisplay() {
        document.getElementById('timezone').textContent = this.timezone;
    }

    getCurrentTimestamp() {
        const systemTime = Date.now() + this.timeOffset;
        return systemTime;
    }

    calculateTemporalPositions(timestamp) {
         const date = new Date(timestamp);
         const positions = {};

         // Calculate milliseconds position (0-999ms)
         const totalMilliseconds = date.getMilliseconds();
         positions.milliseconds = (totalMilliseconds / 1000) * 360;

         // Calculate seconds position (0-59s)
         const totalSeconds = date.getSeconds() + (totalMilliseconds / 1000);
         positions.seconds = (totalSeconds / 60) * 360;

         // Calculate minutes position (0-59min)
         const totalMinutes = date.getMinutes() + (totalSeconds / 60);
         positions.minutes = (totalMinutes / 60) * 360;

         // Calculate hours position (0-23h for Year View, 0-11h for Day View)
         const totalHours = date.getHours() + (totalMinutes / 60);
         positions.hours = (totalHours / 24) * 360; // Year View: 24-hour
         positions.hours12 = ((totalHours % 12) / 12) * 360; // Day View: 12-hour

         // Calculate day-of-year as foundation for all year-based calculations
         const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
         const daysInYear = ((date.getFullYear() % 4 === 0 && date.getFullYear() % 100 !== 0) || date.getFullYear() % 400 === 0) ? 366 : 365;
         const hoursIntoDay = date.getHours() + (date.getMinutes() / 60) + (date.getSeconds() / 3600);
         const progressInYear = (dayOfYear + (hoursIntoDay / 24)) / daysInYear;

         // Calculate days position (0-31 days in month, normalized)
         const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
         const dayInMonth = (date.getDate() - 1) + (hoursIntoDay / 24);
         positions.days = (dayInMonth / daysInMonth) * 360;

         // Calculate day-of-week position (just the day, not intra-week progress)
         const dayOfWeek = (date.getDay() + 6) % 7; // Monday = 0, Sunday = 6
         positions.dayOfWeek = (dayOfWeek / 7) * 360;

         // Calculate weeks position - Use ISO week calculation
         const isoWeek = this.getISOWeekNumber(date);
         let weeksInYear = this.getWeeksInYear(date.getFullYear());
         let weekToUse = isoWeek;
         
         // Handle year-end wraparound: if we're in late December and ISO week is 1, 
         // it's actually week 1 of next year, so use the previous year's week count
         if (date.getMonth() === 11 && isoWeek === 1) {
             weeksInYear = this.getWeeksInYear(date.getFullYear() - 1);
             weekToUse = weeksInYear;
         }
         
         const weekProgress = (weekToUse - 1 + (hoursIntoDay / 24)) / weeksInYear;
         positions.weeks = weekProgress * 360;

         // Calculate months position (year-based)
         const monthInYear = date.getMonth() + (dayInMonth / daysInMonth);
         positions.months = (monthInYear / 12) * 360;

         // Calculate quarters position (year-based)
         const quarter = Math.floor(date.getMonth() / 3);
         const monthInQuarter = date.getMonth() % 3;
         const totalQuarters = quarter + (monthInQuarter + (dayInMonth / daysInMonth)) / 3;
         positions.quarters = (totalQuarters / 4) * 360;

         // Calculate halves position (year-based)
         const half = Math.floor(date.getMonth() / 6);
         const monthInHalf = date.getMonth() % 6;
         const totalHalves = half + (monthInHalf + (dayInMonth / daysInMonth)) / 6;
         positions.halves = (totalHalves / 2) * 360;

         // Calculate year position
         positions.year = progressInYear * 360;

         return positions;
     }

    getISOWeekNumber(date) {
        const target = new Date(date.valueOf());
        const dayNumber = (date.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNumber + 3);
        const firstThursday = target.valueOf();
        target.setMonth(0, 1);
        if (target.getDay() !== 4) {
            target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
        }
        return 1 + Math.ceil((firstThursday - target) / 604800000);
    }

     getWeeksInYear(year) {
         const dec31 = new Date(year, 11, 31);
         const week = this.getISOWeekNumber(dec31);
         return week === 1 ? 52 : week;
     }

    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    generateTemporalCode(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear().toString().slice(-2);
        const half = Math.floor(date.getMonth() / 6) + 1;
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        const month = date.getMonth() + 1;
        const week = this.getISOWeekNumber(date);
        const dayOfWeek = ((date.getDay() + 6) % 7) + 1; // Monday = 1, Sunday = 7

        return `Y${year}-H${half}-Q${quarter}-M${month.toString().padStart(2, '0')}-W${week.toString().padStart(2, '0')}-D${dayOfWeek}`;
    }

    formatConventionalTime(timestamp) {
        const date = new Date(timestamp);
        
        // Format date as YYYY-MM-DD
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        // Format time as HH:MM:SS AM/PM
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 should be 12
        const hoursString = hours.toString().padStart(2, '0');
        
        const timeString = `${hoursString}:${minutes}:${seconds} ${ampm}`;
        
        return { date: dateString, time: timeString };
    }
}

// Enhanced Color System with Flowing ROYGBIV Wave
class ColorSystem {
    constructor() {
        // LUFS color palette
        this.lufsColors = {
            teal: '#78BEBA',
            red: '#D35233', 
            yellow: '#E7B225',
            blue: '#2069af',
            black: '#111111',
            white: '#fbf9e2'
        };
        


        
        // Enhanced spectral map for Year View with day-of-week ring
        this.spectralMap = {
            milliseconds: { hue: 350, saturation: 70, lightness: 60 },  // Pink-red
            seconds: { hue: 0, saturation: 75, lightness: 55 },         // Red
            minutes: { hue: 30, saturation: 80, lightness: 60 },        // Orange
            hours: { hue: 60, saturation: 85, lightness: 65 },          // Yellow
            days: { hue: 90, saturation: 70, lightness: 55 },           // Yellow-green
            dayOfWeek: { hue: 120, saturation: 75, lightness: 60 },     // Green
            weeks: { hue: 150, saturation: 75, lightness: 60 },         // Blue-green
            months: { hue: 180, saturation: 80, lightness: 50 },        // Cyan
            quarters: { hue: 210, saturation: 75, lightness: 55 },      // Blue
            halves: { hue: 270, saturation: 70, lightness: 60 },        // Purple
            year: { hue: 0, saturation: 0, lightness: 90 }           // White outermost for framing
        };
    }


    getTemporalColor(ringType, intensity = 1.0, alpha = 1.0, viewMode = 'year', colorTransition = 0) {
        if (viewMode === 'day') {
            // Day View: Everything white for clean, meditative appearance
            switch (ringType) {
                case 'milliseconds':
                    return `rgba(255, 255, 255, ${alpha * 0.9})`;
                    
                case 'seconds':
                    return `rgba(255, 255, 255, ${alpha * 0.8})`;
                    
                case 'minutes':
                    return `rgba(255, 255, 255, ${alpha * 0.9})`;
                    
                case 'hours':
                    return `rgba(255, 255, 255, ${alpha * 0.9})`;
                    
                case 'dayOfWeek':
                    return `rgba(255, 255, 255, ${alpha * 0.6})`;
                    
                case 'days':
                    return `rgba(255, 255, 255, ${alpha * 0.5})`;
                    
                default:
                    return `rgba(255, 255, 255, ${alpha * 0.4})`;
            }
        } else {
            // Year View: Use spectral colors with expanded hierarchy
            const baseColor = this.spectralMap[ringType];
            if (baseColor) {
                const adjustedLightness = Math.max(20, Math.min(80, 
                    baseColor.lightness * intensity));
                return `hsla(${baseColor.hue}, ${baseColor.saturation}%, ${adjustedLightness}%, ${alpha})`;
            }
        }
        
        return this.getLufsColor('white', alpha);
    }

    getLufsColor(colorName, alpha = 1.0) {
        const color = this.lufsColors[colorName];
        if (alpha === 1.0) return color;
        
        // Convert hex to rgba
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}

// Enhanced Animation Controller with 12h/24h transitions and optimized Day View sizing
class AnimationController {
    constructor() {
        this.transitionDuration = 1000; // milliseconds
        this.currentTransition = null;
        this.viewMode = 'year'; // 'year' or 'day'
        this.scale = 1.0;
        this.rotation = 0;
        this.targetScale = 1.0;
        this.targetRotation = 0;
        
        // Day View ring size multipliers for traditional clock layout
         // Hour ring moved closer to center, minute ring as outer ring
         this.dayViewRingSizes = {
             milliseconds: 0.15,  // Much smaller, less prominent
             seconds: 0.35,       // Moderate size
             hours: 0.60,         // Hour ring closer to center (shorter hand)
             minutes: 0.80,       // Minute ring outer (longer hand)
             days: 1.0           // Full size to ensure minute hand is visible
         };
        
        // Animation state for smooth transitions
        this.colorTransition = 0; // 0 = Year View colors, 1 = Day View colors
        this.targetColorTransition = 0;
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    startViewTransition(newViewMode) {
        if (this.currentTransition) return;

        const oldViewMode = this.viewMode;
        this.viewMode = newViewMode;

        if (newViewMode === 'day') {
            this.targetScale = 3.5; // Slightly less zoom to show more of the hour ring
            this.targetRotation = 0;
        } else {
            this.targetScale = 1.0;
            this.targetRotation = 0;
        }

        const startScale = this.scale;
        const startRotation = this.rotation;
        const startTime = performance.now();

        this.currentTransition = {
            startTime,
            startScale,
            startRotation,
            oldViewMode,
            newViewMode
        };

        // Update body class for CSS transitions
        document.body.classList.toggle('day-view', newViewMode === 'day');
        
        // Trigger ring labels update
        this.updateRingLabels(newViewMode);
    }

    updateRingLabels(viewMode) {
        // This will be called by the rendering engine to update labels
        if (window.renderingEngine) {
            window.renderingEngine.updateRingLabels(viewMode);
        }
    }

    updateTransition() {
        if (!this.currentTransition) return false;

        const elapsed = performance.now() - this.currentTransition.startTime;
        const progress = Math.min(elapsed / this.transitionDuration, 1.0);
        const easedProgress = this.easeInOutCubic(progress);

        this.scale = this.currentTransition.startScale + 
            (this.targetScale - this.currentTransition.startScale) * easedProgress;
        
        this.rotation = this.currentTransition.startRotation + 
            (this.targetRotation - this.currentTransition.startRotation) * easedProgress;

        if (progress >= 1.0) {
            this.currentTransition = null;
            return false;
        }

        return true;
    }

    getViewTransform() {
        return {
            scale: this.scale,
            rotation: this.rotation,
            viewMode: this.viewMode,
            dayViewRingSizes: this.dayViewRingSizes
        };
    }
}

// Enhanced Rendering Engine with embedded ring labels
class RenderingEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.devicePixelRatio = window.devicePixelRatio || 1;
        this.centerX = 0;
        this.centerY = 0;
        this.maxRadius = 0;
        this.ringData = this.initializeRings();
        this.animationController = new AnimationController();
        this.labelsContainer = document.getElementById('ringLabelsOverlay');
        this.setupCanvas();
        this.initializeRingLabels();
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        const size = Math.min(container.clientWidth, container.clientHeight) * 0.75;
        
        this.canvas.width = size * this.devicePixelRatio;
        this.canvas.height = size * this.devicePixelRatio;
        this.canvas.style.width = size + 'px';
        this.canvas.style.height = size + 'px';
        
        this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
        this.centerX = size / 2;
        this.centerY = size / 2;
        this.maxRadius = size * 0.42;
        
        this.updateRingRadii();
        this.updateLabelsContainerSize(size);
    }

    updateLabelsContainerSize(size) {
        this.labelsContainer.style.width = size + 'px';
        this.labelsContainer.style.height = size + 'px';
    }

    initializeRings() {
        return [
            { name: 'milliseconds', thickness: 1.5, alpha: 0.9 },
            { name: 'seconds', thickness: 2, alpha: 0.9 },
            { name: 'minutes', thickness: 2.5, alpha: 0.8 },
            { name: 'hours', thickness: 3, alpha: 0.8 },
            { name: 'days', thickness: 3.5, alpha: 0.7 },
            { name: 'dayOfWeek', thickness: 4, alpha: 0.7 },  // New day-of-week ring
            { name: 'weeks', thickness: 4.5, alpha: 0.7 },
            { name: 'months', thickness: 5, alpha: 0.6 },
            { name: 'quarters', thickness: 5.5, alpha: 0.6 },
            { name: 'halves', thickness: 6, alpha: 0.5 },
            { name: 'year', thickness: 6.5, alpha: 0.5 }
        ];
    }

    updateRingRadii() {
        const radiusStep = this.maxRadius / this.ringData.length;
        this.ringData.forEach((ring, index) => {
            ring.baseRadius = radiusStep * (index + 1);
            ring.radius = ring.baseRadius; // Will be modified in Day View
        });
    }

    getAdjustedRadius(ring, transform) {
        if (transform.viewMode === 'day' && transform.dayViewRingSizes && transform.dayViewRingSizes[ring.name]) {
            // Apply Day View size multiplier
            return ring.baseRadius * transform.dayViewRingSizes[ring.name];
        }
        return ring.baseRadius;
    }

     initializeRingLabels() {
         this.labelsContainer.innerHTML = '';
         
         const ringLabels = {
             milliseconds: Array.from({length: 10}, (_, i) => (i * 100).toString()),
             seconds: Array.from({length: 12}, (_, i) => (i * 5).toString()),
             minutes: Array.from({length: 12}, (_, i) => (i * 5).toString()),
             hours: Array.from({length: 24}, (_, i) => (i + 1).toString()),
             days: Array.from({length: 8}, (_, i) => (i * 4 + 1).toString()),
             dayOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
              weeks: Array.from({length: 52}, (_, i) => `W${(i + 1).toString().padStart(2, '0')}`),
             months: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
             quarters: ['Q1', 'Q2', 'Q3', 'Q4'],
             halves: ['H1', 'H2'],
             year: ['JAN', 'APR', 'JUL', 'OCT']
         };

         this.ringData.forEach((ring, ringIndex) => {
             const labels = ringLabels[ring.name];
             
             labels.forEach((label, labelIndex) => {
                 const labelElement = document.createElement('div');
                 labelElement.className = `ring-label ${ring.name}`;
                 labelElement.textContent = label;
                 labelElement.dataset.ring = ring.name;
                 labelElement.dataset.index = labelIndex;
                 this.labelsContainer.appendChild(labelElement);
             });
         });

        this.updateRingLabels('year');
    }

    updateRingLabels(viewMode) {
         const transform = this.animationController.getViewTransform();
         
         this.ringData.forEach((ring, ringIndex) => {
             const labels = this.labelsContainer.querySelectorAll(`.ring-label.${ring.name}`);
             
             // Handle hour ring transition between 24h and 12h
             if (ring.name === 'hours') {
                 this.updateHourLabels(labels, viewMode, transform);
             } else if (ring.name === 'minutes') {
                 this.updateMinuteLabels(labels, viewMode, transform);
             } else {
                 this.updateRegularLabels(labels, ring, transform, viewMode);
             }
         });
     }

    updateHourLabels(labels, viewMode, transform) {
        const ring = this.ringData.find(r => r.name === 'hours');
        const radius = this.getAdjustedRadius(ring, transform) * transform.scale;
        
        if (viewMode === 'day') {
            // 12-hour format with labels positioned well inside the ring for traditional clock appearance
            const hour12Labels = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
            labels.forEach((label, index) => {
                if (index < 12) {
                    label.textContent = hour12Labels[index];
                    label.style.display = 'block';
                    
                    const angle = (index / 12) * 2 * Math.PI - Math.PI / 2;
                    // Position labels 25% inside the ring for better traditional clock appearance
                    const labelRadius = radius * 0.75;
                    const x = Math.cos(angle) * labelRadius;
                    const y = Math.sin(angle) * labelRadius;
                    
                    label.style.left = `50%`;
                    label.style.top = `50%`;
                    label.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
                } else {
                    label.style.display = 'none';
                }
            });
         } else {
             // 24-hour format (0-23)
             labels.forEach((label, index) => {
                 if (index < 24) {
                     label.textContent = index.toString();
                     label.style.display = 'block';
                     
                     const angle = (index / 24) * 2 * Math.PI - Math.PI / 2;
                     const x = Math.cos(angle) * radius;
                     const y = Math.sin(angle) * radius;
                     
                     label.style.left = `50%`;
                     label.style.top = `50%`;
                     label.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
                 } else {
                     label.style.display = 'none';
                 }
             });
         }
    }

    updateMinuteLabels(labels, viewMode, transform) {
        const minuteRing = this.ringData.find(r => r.name === 'minutes');
        const hourRing = this.ringData.find(r => r.name === 'hours');
        
        if (viewMode === 'day') {
            const minuteRadius = this.getAdjustedRadius(minuteRing, transform) * transform.scale;
            const hourRadius = this.getAdjustedRadius(hourRing, transform) * transform.scale;
            
            // Position minute numbers inside the minute ring area, similar to hour numbers
            const labelRadius = hourRadius + (minuteRadius - hourRadius) * 0.3; // 30% from hour ring toward minute ring
            
            // Show minute markers at 5-minute intervals (0, 5, 10, 15, etc.)
            const minuteLabels = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
            
            labels.forEach((label, index) => {
                if (index < 12) {
                    label.textContent = minuteLabels[index];
                    label.style.display = 'block';
                    
                    const angle = (index / 12) * 2 * Math.PI - Math.PI / 2;
                    const x = Math.cos(angle) * labelRadius;
                    const y = Math.sin(angle) * labelRadius;
                    
                    label.style.left = `50%`;
                    label.style.top = `50%`;
                    label.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
                    label.className = 'ring-label minutes';
                    
                    // Color minute numbers to match the flowing minute ring color
                    const minuteColor = colorSystem.getTemporalColor('minutes', 1.0, 1.0, 'day');
                    label.style.color = minuteColor;
                    label.style.textShadow = `0 0 6px ${minuteColor}`;
                } else {
                    label.style.display = 'none';
                }
            });
        } else {
            // Hide minute numbers in Year View
            labels.forEach(label => {
                label.style.display = 'none';
            });
        }
    }

    updateRegularLabels(labels, ring, transform, viewMode) {
        const radius = this.getAdjustedRadius(ring, transform) * transform.scale;
        
        labels.forEach((label, index) => {
            const totalLabels = labels.length;
            const angle = (index / totalLabels) * 2 * Math.PI - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            label.style.left = `50%`;
            label.style.top = `50%`;
            label.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        });
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width / this.devicePixelRatio, this.canvas.height / this.devicePixelRatio);
    }

    drawCosmicBackground(transform) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(this.centerX, this.centerY);
        ctx.scale(transform.scale, transform.scale);

        // Subtle geometric network
        const time = Date.now() * 0.0001;
        const patternDensity = transform.viewMode === 'day' ? 0.3 : 1.0;
        
        // Draw constellation-like connections
        for (let i = 0; i < 8 * patternDensity; i++) {
            const angle1 = (i / 8) * Math.PI * 2 + time;
            const angle2 = ((i + 1) / 8) * Math.PI * 2 + time;
            const radius1 = this.maxRadius * (0.3 + 0.2 * Math.sin(time * 2 + i));
            const radius2 = this.maxRadius * (0.4 + 0.15 * Math.cos(time * 1.5 + i));
            
            const x1 = Math.cos(angle1) * radius1;
            const y1 = Math.sin(angle1) * radius1;
            const x2 = Math.cos(angle2) * radius2;
            const y2 = Math.sin(angle2) * radius2;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = colorSystem.getLufsColor('teal', 0.1);
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        // Subtle pulsing nodes
        for (let i = 0; i < 12 * patternDensity; i++) {
            const angle = (i / 12) * Math.PI * 2 + time * 0.5;
            const radius = this.maxRadius * (0.2 + 0.3 * Math.sin(time + i * 0.5));
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const size = 1 + Math.sin(time * 3 + i) * 0.5;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = colorSystem.getLufsColor('yellow', 0.15);
            ctx.fill();
        }

        ctx.restore();
    }

    drawTemporalRing(ringName, angle, positions, transform, colorTransition = 0) {
        const ring = this.ringData.find(r => r.name === ringName);
        if (!ring) return;

        let ringAlpha = ring.alpha;
        if (transform.viewMode === 'day') {
            const ringIndex = this.ringData.findIndex(r => r.name === ringName);
            if (ringIndex < 5) { // milliseconds, seconds, minutes, hours, days
                ringAlpha *= 1.3;
            } else {
                ringAlpha *= 0.2;
            }
        }

        // Get adjusted radius for Day View
        const adjustedRadius = this.getAdjustedRadius(ring, transform);

        const ctx = this.ctx;
        ctx.save();
        ctx.translate(this.centerX, this.centerY);
        ctx.scale(transform.scale, transform.scale);

        // Draw ring base
        ctx.beginPath();
        ctx.arc(0, 0, adjustedRadius, 0, Math.PI * 2);
        ctx.strokeStyle = colorSystem.getTemporalColor(ringName, 0.4, ringAlpha * 0.4, transform.viewMode, colorTransition);
        ctx.lineWidth = ring.thickness;
        ctx.stroke();

        // Draw progress arc
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (angle * Math.PI / 180);
        
        ctx.beginPath();
        ctx.arc(0, 0, adjustedRadius, startAngle, endAngle);
        ctx.strokeStyle = colorSystem.getTemporalColor(ringName, 1.2, ringAlpha, transform.viewMode, colorTransition);
        ctx.lineWidth = ring.thickness;
        ctx.stroke();

        // Draw position indicator
        this.drawPositionIndicator(ring, angle, ringAlpha, transform.viewMode, adjustedRadius);

        ctx.restore();
    }

    drawPositionIndicator(ring, angle, alpha, viewMode, radius) {
        const ctx = this.ctx;
        const indicatorAngle = (angle - 90) * Math.PI / 180;
        const x = Math.cos(indicatorAngle) * radius;
        const y = Math.sin(indicatorAngle) * radius;

        // Slower, more meditative pulsing animation
        const pulseIntensity = 0.7 + 0.3 * Math.sin(Date.now() * 0.002);
        
        // Smaller, more refined dot sizes - especially for Day View
        let baseIndicatorSize = viewMode === 'day' ? 1.5 : 2.5;
        
        // Further reduce size for inner rings in Day View (milliseconds, seconds)
        if (viewMode === 'day') {
            const ringIndex = this.ringData.findIndex(r => r.name === ring.name);
            if (ringIndex === 0) { // milliseconds
                baseIndicatorSize = 0.8;
            } else if (ringIndex === 1) { // seconds
                baseIndicatorSize = 1.0;
            } else if (ringIndex === 2) { // minutes
                baseIndicatorSize = 1.3;
            }
        }
        
        const indicatorSize = baseIndicatorSize + pulseIntensity * 0.8;

        // Outer glow - more subtle
        ctx.beginPath();
        ctx.arc(x, y, indicatorSize * 2.0, 0, Math.PI * 2);
        ctx.fillStyle = colorSystem.getTemporalColor(ring.name, 1.0, 0.12 * alpha, viewMode);
        ctx.fill();

        // Inner bright dot
        ctx.beginPath();
        ctx.arc(x, y, indicatorSize, 0, Math.PI * 2);
        ctx.fillStyle = colorSystem.getTemporalColor(ring.name, 1.4, 0.85 * alpha, viewMode);
        ctx.fill();

        // Connecting line - slightly thinner
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        ctx.strokeStyle = colorSystem.getTemporalColor(ring.name, 1.0, 0.25 * alpha, viewMode);
        ctx.lineWidth = viewMode === 'day' ? 0.8 : 1;
        ctx.stroke();
    }

    render(positions) {
        this.animationController.updateTransition();
        const transform = this.animationController.getViewTransform();

        this.clear();
        this.drawCosmicBackground(transform);

        // Draw all temporal rings including dayOfWeek
        const ringOrder = ['year', 'halves', 'quarters', 'months', 'weeks', 'days', 'dayOfWeek', 'hours', 'minutes', 'seconds', 'milliseconds'];
        
        ringOrder.forEach(ringName => {
            if (positions[ringName] !== undefined) {
                // Use 12-hour format for hours in Day View
                let angle = positions[ringName];
                if (ringName === 'hours' && transform.viewMode === 'day' && positions.hours12 !== undefined) {
                    angle = positions.hours12;
                }
                this.drawTemporalRing(ringName, angle, positions, transform, this.animationController.colorTransition);
            }
        });

        // Draw center point
        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);
        this.ctx.scale(transform.scale, transform.scale);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 2, 0, Math.PI * 2);
        this.ctx.fillStyle = colorSystem.getLufsColor('white', 0.8);
        this.ctx.fill();
        this.ctx.restore();

        // Update ring labels
        this.updateRingLabels(transform.viewMode);
    }

    switchViewMode(viewMode) {
        this.animationController.startViewTransition(viewMode);
    }
}

// Initialize the application
const temporalEngine = new TemporalEngine();
const colorSystem = new ColorSystem();
const canvas = document.getElementById('timeCanvas');
const renderingEngine = new RenderingEngine(canvas);

// Make renderingEngine globally accessible for animation controller
window.renderingEngine = renderingEngine;

// Update displays
function updateDisplays() {
    const timestamp = temporalEngine.getCurrentTimestamp();
    
    // Update temporal code
    const code = temporalEngine.generateTemporalCode(timestamp);
    document.getElementById('temporalCode').textContent = code;
    
    // Update conventional time
    const conventional = temporalEngine.formatConventionalTime(timestamp);
    document.getElementById('dateDisplay').textContent = conventional.date;
    document.getElementById('timeDisplay').textContent = conventional.time;
}

// Main animation loop
function animate() {
    const timestamp = temporalEngine.getCurrentTimestamp();
    const viewMode = renderingEngine.animationController.viewMode;
    const positions = temporalEngine.calculateTemporalPositions(timestamp, viewMode);
    
    updateDisplays();
    renderingEngine.render(positions);
    
    requestAnimationFrame(animate);
}

// Initialize
window.addEventListener('load', () => {
    animate();
});

window.addEventListener('resize', () => {
    renderingEngine.setupCanvas();
});

// View mode controls
document.getElementById('yearViewBtn').addEventListener('click', () => {
    document.querySelectorAll('.control-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('yearViewBtn').classList.add('active');
    renderingEngine.switchViewMode('year');
});

document.getElementById('dayViewBtn').addEventListener('click', () => {
    document.querySelectorAll('.control-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('dayViewBtn').classList.add('active');
    renderingEngine.switchViewMode('day');
});

