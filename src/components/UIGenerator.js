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
            input.addEventListener('input', (e) => {
                onInputCallback(e.target.value);
            });
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

    createElementPreview(parent, labelText = 'Selected Element Preview') {
        const previewContainer = document.createElement('div');
        previewContainer.className = 'element-preview';
        
        const previewLabel = document.createElement('div');
        previewLabel.className = 'preview-label';
        previewLabel.textContent = labelText;
        
        const previewContent = document.createElement('div');
        previewContent.className = 'preview-content';
        
        previewContainer.appendChild(previewLabel);
        previewContainer.appendChild(previewContent);
        parent.appendChild(previewContainer);
        
        return {
            container: previewContainer,
            update: (data) => {
                previewContent.innerHTML = '';
                if (data.exists) {
                    if (data.originalText && data.originalText !== data.text) {
                        // Show both original and filtered text for cases with filtering
                        previewContent.innerHTML = `
                            <div class="preview-text">Original: ${data.originalText}</div>
                            <div class="preview-text">Filtered: ${data.text}</div>
                        `;
                    } else {
                        // Show only the text for cases without filtering
                        previewContent.innerHTML = `<div class="preview-text">${data.text || 'Empty content'}</div>`;
                    }
                    
                    // If it's a link, show the href
                    if (data.isLink && data.href) {
                        previewContent.innerHTML += `<div class="preview-href">Link: ${data.href}</div>`;
                    }
                } else {
                    previewContent.textContent = 'No element selected';
                }
            }
        };
    }
}
