// dom elements
const tl = document.querySelector('.tl');

const lights = {
    r: tl.querySelector('.red'),
    y: tl.querySelector('.yellow'),
    g: tl.querySelector('.green'),
}

const switchBtn = document.querySelector('.switch-btn');

// options
const delayToAct = 1000; // час до включеня зеленого світла
const planedSwitch = 20000; // планова активація червоного
const ltL = {
    r: {
        lt: 6000, // час скільки горить червоний
        blink: 2000,
    },
    y: {
        lt: 4000, // час скільки горить жовтий
        blink: 2000,
    },
    g: {
        // зелений не має лайфтайму бо горить завжди, коли не активовано  червоний, тому у нього унікальний  алгоритмчасу  світіння
        blink: 3000,
    },
}

// model
let isActive = false;
let lastActivate = 0;

// helpers
const getColorEl = (color) => {
    const colorEl = lights[color];
    
    if(!colorEl) { // спрацює якщо колір не існує
        throw new Error(`колір ${color} не існує`);
    }

    return colorEl;
}

// ctrl + view
const activateL = (color) => {
    const colorEl = getColorEl(color);

    // activete  
    colorEl.classList.add('active');
}

const activateBlink = (color) => {
    const colorEl = getColorEl(color);

    // blink
    colorEl.classList.add('blink');
}

const deactivateL = (color) => {
    const colorEl = getColorEl(color);

    // deactivate
    colorEl.classList.remove('active');
    colorEl.classList.remove('blink');
}

const switchToR = () => new Promise((resolve, reject) => {
    lastActivate = Date.now();

    if(ltL.g.blink) { 
        activateBlink('g');
    }

    setTimeout(() => {
        // activate red
        deactivateL('g');
        activateL('r');

        if(ltL.y.lt) {
            activateL('y');
            setTimeout(() => activateBlink('y'), ltL.r.lt - ltL.y.lt);
        }

        if(ltL.y.blink) {
            setTimeout(() => activateBlink('y'), ltL.r.lt - ltL.y.blink);
        }

        // blink red
        if(ltL.r.blink) {
            setTimeout(() => activateBlink('r'), ltL.r.lt - ltL.r.blink);
        }

        // deactivate red
        setTimeout(() => {
            deactivateL('r');
            deactivateL('y');

            activateL('g');
            isActive = false;
            resolve();
        }, ltL.r.lt);

    }, ltL.g.blink);
});

// services
const planedSwitchToR = async () => {
    const durSwitch = ltL.r.lt +  ltL.y.lt + ltL.g.blink; // тривалість  процесу переключеня
    const dellayFull = durSwitch + delayToAct; // тривалість  процесу переключеня + мінімальний час  між  переключенями
    const nearActivate = lastActivate + dellayFull + planedSwitch; // це час коли має бути наступна активація
    const now = Date.now();

    if(nearActivate > now || isActive) {
        const nextTry = nearActivate - now;
        setTimeout(planedSwitchToR, nextTry);
        return;
    }

    await switchToR();
    setTimeout(planedSwitchToR, planedSwitch);
}

// acrivators
switchBtn.addEventListener('click', () => {
    if(isActive) { // ігноруй натискання якщо  процес вже іде
        return;
    }

    isActive = true;
    setTimeout(switchToR, delayToAct);
});

// runner
activateL('g');
planedSwitchToR();

