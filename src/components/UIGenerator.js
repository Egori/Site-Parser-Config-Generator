class UIGenerator {
    createSelectorInput(labelText, parent, onInputCallback, onSelectCallback) {
        const group = document.createElement('div');
        group.className = 'field-group';
        
        const label = document.createElement('label');
        label.textContent = labelText;
        
        const inputContainer = document.createElement('div');
        inputContainer.className = 'selector-input';
        
        const input = document.createElement('input');
        input.type = 'text';
        
        const button = document.createElement('button');
        button.textContent = 'Select';
        button.addEventListener('click', () => {
            if (onSelectCallback) onSelectCallback(input);
        });
        
        if (onInputCallback) {
            input.addEventListener('input', (e) => onInputCallback(e.target.value));
        }
        
        inputContainer.appendChild(input);
        inputContainer.appendChild(button);
        group.appendChild(label);
        group.appendChild(inputContainer);
        
        parent.appendChild(group);
        return input;
    }

    createTextInput(labelText, parent, onInputCallback) {
        const group = document.createElement('div');
        group.className = 'field-group';
        
        const label = document.createElement('label');
        label.textContent = labelText;
        
        const input = document.createElement('input');
        input.type = 'text';
        
        if (onInputCallback) {
            input.addEventListener('input', (e) => onInputCallback(e.target.value));
        }
        
        group.appendChild(label);
        group.appendChild(input);
        parent.appendChild(group);
        
        return input;
    }

    createCheckbox(labelText, parent, onChangeCallback) {
        const container = document.createElement('div');
        container.className = 'checkbox-group';
        container.innerHTML = `
            <input type="checkbox" id="${labelText.replace(/\s+/g, '')}">
            <label for="${labelText.replace(/\s+/g, '')}">${labelText}</label>
        `;
        
        const checkbox = container.querySelector('input');
        if (onChangeCallback) {
            checkbox.addEventListener('change', (e) => onChangeCallback(e.target.checked));
        }
        
        parent.appendChild(container);
        return checkbox;
    }

    createButton(text, className, onClickCallback) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = className;
        
        if (onClickCallback) {
            button.addEventListener('click', onClickCallback);
        }
        
        return button;
    }
}
