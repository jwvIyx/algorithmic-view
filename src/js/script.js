const initialArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
let currentArray = [...initialArray];

const searchState = {
    low: null,
    high: null,
    target: null,
    isSearching: false,
    iterations: 0,
    sortedArray: []
};

function createElementWithClass(elementType, className) {
    const element = document.createElement(elementType);
    element.className = className;
    return element;
}

function createSegmentWithIndexAndValue(item, index) {
    const segment = createElementWithClass("div", "segment");
    
    if (index !== undefined) {
        segment.setAttribute("data-index", index);
        
        const indexSpan = createElementWithClass("span", "index");
        indexSpan.textContent = `${index}`;
        segment.appendChild(indexSpan);
    }
    
    const itemSpan = createElementWithClass("span", "item");
    itemSpan.textContent = item;
    segment.appendChild(itemSpan);
    
    return segment;
}

function renderArray() {
    const arrayBox = document.getElementById("arrayBox");
    arrayBox.innerHTML = "";

    const sortedInitialArray = [...initialArray].sort((a, b) => a - b);
    
    sortedInitialArray.forEach((item, index) => {
        arrayBox.appendChild(createSegmentWithIndexAndValue(item, index));
    });
}

function adjustArrayWidth(arrayElement, arrayLength) {
    const maxWidth = 100;
    const minWidth = 20;
    const initialLength = initialArray.length;
    
    if (arrayLength <= 2 && !arrayElement.classList.contains('found')) {
        const squareSize = 60;
        arrayElement.style.width = `${squareSize * arrayLength}px`;
        arrayElement.style.height = `${squareSize}px`;
        arrayElement.classList.add('small-array');
        return;
    }
    
    const newWidth = Math.max(
        minWidth,
        (arrayLength / initialLength) * maxWidth
    );
    
    arrayElement.style.width = `${newWidth}vh`;
}

function renderNewArray(array, containerClass) {
    const newDiv = createElementWithClass("div", containerClass);

    array.forEach((item) => {
        newDiv.appendChild(createSegmentWithIndexAndValue(item.value, item.index));
    });
    
    adjustArrayWidth(newDiv, array.length);

    return newDiv;
}

function updateStatusPanel(data = {}) {
    document.getElementById('targetValue').textContent = data.target !== undefined ? data.target : '-';
    document.getElementById('lowValue').textContent = data.low !== undefined ? data.low : '-';
    document.getElementById('highValue').textContent = data.high !== undefined ? data.high : '-';
    document.getElementById('midValue').textContent = data.mid !== undefined ? data.mid : '-';
    document.getElementById('guessValue').textContent = data.guess !== undefined ? data.guess : '-';
    document.getElementById('resultValue').textContent = data.result || '-';
}

function resetSearch(target) {
    const existingBoxes = document.querySelectorAll('.new-box');
    existingBoxes.forEach(box => box.remove());
    
    searchState.sortedArray = [...initialArray].sort((a, b) => a - b);
    
    const low = 0;
    const high = searchState.sortedArray.length - 1;
    const mid = Math.floor((low + high) / 2);
    const guess = searchState.sortedArray[mid];
    
    Object.assign(searchState, {
        low: low,
        high: high,
        target,
        isSearching: true,
        iterations: 0
    });
    
    updateStatusPanel({
        target: target,
        low: low,
        high: high,
        mid: mid,
        guess: guess,
        result: 'Performing first step...'
    });
    
    return performSearchStep();
}

function performSearchStep() {
    if (searchState.low <= searchState.high) {
        const mid = Math.floor((searchState.low + searchState.high) / 2);
        const guess = searchState.sortedArray[mid];
        searchState.iterations++;
        
        let result = 'Searching...';
        
        if (guess === searchState.target) {
            const finalDiv = renderNewArray([{value: guess, index: mid}], 'new-box found');
            finalDiv.style.width = '';
            
            document.getElementById("container").appendChild(finalDiv);
            searchState.isSearching = false;
            
            result = `Found target ${searchState.target} at position mid=${mid}!`;
            updateStatusPanel({
                target: searchState.target,
                low: searchState.low,
                high: searchState.high,
                mid: mid,
                guess: guess,
                result: result
            });
            
            return { 
                found: true, 
                message: `Found: ${guess} in iteration ${searchState.iterations}`, 
                iteration: searchState.iterations 
            };
        }

        let nextSearchLow, nextSearchHigh;
        
        if (guess > searchState.target) {
            result = `${guess} > ${searchState.target}, so target must be in left half. Setting high = mid-1 (${mid-1})`;
            nextSearchLow = searchState.low;
            nextSearchHigh = mid - 1;
            searchState.high = mid - 1;
        } else {
            result = `${guess} < ${searchState.target}, so target must be in right half. Setting low = mid+1 (${mid+1})`;
            nextSearchLow = mid + 1;
            nextSearchHigh = searchState.high;
            searchState.low = mid + 1;
        }
        
        const currentSlice = [];
        for (let i = nextSearchLow; i <= nextSearchHigh; i++) {
            currentSlice.push({
                value: searchState.sortedArray[i],
                index: i
            });
        }
        
        updateStatusPanel({
            target: searchState.target,
            low: searchState.low,
            high: searchState.high,
            mid: mid,
            guess: guess,
            result: result
        });
        
        const newDiv = renderNewArray(currentSlice, 'new-box');
        document.getElementById("container").appendChild(newDiv);
        
        let explanationMessage;
        if (guess > searchState.target) {
            explanationMessage = `Iteration ${searchState.iterations}: guess (${guess}) > target (${searchState.target}), so we discard right half and search between indices ${searchState.low} and ${searchState.high}`;
        } else {
            explanationMessage = `Iteration ${searchState.iterations}: guess (${guess}) < target (${searchState.target}), so we discard left half and search between indices ${searchState.low} and ${searchState.high}`;
        }
        
        return { 
            found: false, 
            message: explanationMessage, 
            iteration: searchState.iterations 
        };
    } 
    
    searchState.isSearching = false;
    updateStatusPanel({
        target: searchState.target,
        low: searchState.low,
        high: searchState.high,
        result: 'Target not found in array'
    });
    
    return { 
        found: false, 
        message: `Item ${searchState.target} not found - low (${searchState.low}) is now greater than high (${searchState.high})`, 
        iteration: searchState.iterations 
    };
}

function binarySearchStep(item) {
    if (!searchState.isSearching) {
        return resetSearch(item);
    }

    return performSearchStep();
}

function startSearch() {
    const inputElement = document.getElementById('targetInput');
    const targetValue = parseInt(inputElement.value);
    
    if (isNaN(targetValue) || targetValue < 1 || targetValue > 20) {
        alert('Please enter a valid number between 1 and 20');
        return;
    }
    
    binarySearchStep(targetValue);
}

updateStatusPanel();
renderArray();
