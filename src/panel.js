// Chrome API Service
class ChromeAPIService {
    static sendMessageToActiveTab(message, callback) {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, message, callback);
            }
        });
    }
}

// Preview Service
class PreviewService {
    static getElementInfo(selector, attribute, regex, previewElement) {
        if (!selector) return;

        ChromeAPIService.sendMessageToActiveTab({
            type: 'GET_ELEMENT_INFO',
            selector: selector,
            ...attribute && { [attribute.type]: attribute.value }
        }, response => {
            if (response && response.success) {
                let displayText = response.text;
                let previewData = {
                    exists: true,
                    originalText: displayText,
                    text: displayText,
                    isLink: response.isLink,
                    href: response.href
                };

                if (regex && displayText) {
                    if (!regex.test(displayText)) {
                        previewData.text = 'No match';
                    }
                }

                previewElement.update(previewData);
            } else {
                previewElement.update({ exists: false });
            }
        });
    }
}

class ConfigGenerator {
    constructor() {
        this.uiGenerator = new UIGenerator();
        this.configManager = new ConfigManager();
        this.activeInput = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this._setupMainUrlListener();
        this._setupButtonListeners();
        this._setupMessageListener();
    }

    _setupMainUrlListener() {
        document.getElementById('mainUrl').addEventListener('input', (e) => {
            this.configManager.setMainUrl(e.target.value);
            this.updateJsonPreview();
        });
    }

    _setupButtonListeners() {
        document.getElementById('addCatalog').addEventListener('click', () => this.addCatalog());
        document.getElementById('addPost').addEventListener('click', () => this.addPost());
        document.getElementById('generateJson').addEventListener('click', () => this.updateJsonPreview());
        document.getElementById('downloadJson').addEventListener('click', () => this.configManager.downloadConfig());
    }

    _setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            try {
                if (message.type === 'UPDATE_SELECTOR' && this.activeInput) {
                    this.handleElementSelected(message.data);
                }
            } catch (error) {
                console.error('Error handling message:', error);
            }
        });
    }

    startElementSelection(input) {
        this.activeInput = input;
        try {
            ChromeAPIService.sendMessageToActiveTab({type: 'START_SELECTING'});
        } catch (error) {
            console.error('Error sending message to tab:', error);
        }
    }

    handleElementSelected(data) {
        if (this.activeInput) {
            this.activeInput.value = data.selector;
            const event = new Event('input', {
                bubbles: true,
                cancelable: true,
            });
            this.activeInput.dispatchEvent(event);
            this.activeInput = null;
        }
    }

    // Catalog Management
    addCatalog() {
        const catalogList = document.getElementById('catalogList');
        const catalogContainer = document.createElement('div');
        catalogContainer.className = 'config-item';

        const catalog = this.configManager.addCatalog({});
        this._createCatalogInputs(catalogContainer, catalog);
        this._createCatalogPreviewElements(catalogContainer, catalog);
        this._createCatalogButtons(catalogContainer, catalog);

        catalogList.appendChild(catalogContainer);
    }

    _createCatalogInputs(container, catalog) {
        this.uiGenerator.createTextInput('Catalog Name', container, (value) => {
            catalog.name = value;
            this.updateJsonPreview();
        });

        this.uiGenerator.createSelectorInput('Link Selector', container, 
            (value) => {
                catalog.linkSelector = value;
                this.updateJsonPreview();
                this._updateCatalogPreviews(catalog);
            }, 
            (input) => this.startElementSelection(input)
        );

        this.uiGenerator.createTextInput('Child Catalog Name', container, (value) => {
            catalog.childCatalogName = value;
            this.updateJsonPreview();
        });

        this.uiGenerator.createTextInput('Child Post Name', container, (value) => {
            catalog.childPostName = value;
            this.updateJsonPreview();
        });

        this.uiGenerator.createSelectorInput('Pagination Link Selector', container, 
            (value) => {
                catalog.paginationLinkSelector = value;
                this.updateJsonPreview();
                this._updateCatalogPreviews(catalog);
            }, 
            (input) => this.startElementSelection(input)
        );
    }

    _createCatalogPreviewElements(container, catalog) {
        this.linkPreview = this.uiGenerator.createElementPreview(container, 'Link Preview');
        this.paginationPreview = this.uiGenerator.createElementPreview(container, 'Pagination Link Preview');
    }

    _updateCatalogPreviews(catalog) {
        PreviewService.getElementInfo(
            catalog.linkSelector,
            null,
            null,
            this.linkPreview
        );

        PreviewService.getElementInfo(
            catalog.paginationLinkSelector,
            null,
            null,
            this.paginationPreview
        );
    }

    _createCatalogButtons(container, catalog) {
        this.uiGenerator.createCheckbox('Is Main Catalog', container, (checked) => {
            catalog.isMain = checked;
            this.updateJsonPreview();
        });

        const addFieldButton = this.uiGenerator.createButton('Add Field', 'add-button', () => {
            const newField = this.configManager.addFieldToCatalog(catalog, {});
            this.createField(container, newField);
        });
        container.appendChild(addFieldButton);

        const removeButton = this.uiGenerator.createButton('Remove Catalog', 'remove-button', () => {
            this.configManager.removeCatalog(catalog);
            container.remove();
            this.updateJsonPreview();
        });
        container.appendChild(removeButton);
    }

    // Post Management
    addPost() {
        const postList = document.getElementById('postList');
        const postContainer = document.createElement('div');
        postContainer.className = 'config-item';

        const post = this.configManager.addPost({});
        this._createPostInputs(postContainer, post);
        this._createPostPreviewElements(postContainer, post);
        this._createPostButtons(postContainer, post);

        postList.appendChild(postContainer);
    }

    _createPostInputs(container, post) {
        this.uiGenerator.createTextInput('Post Name', container, (value) => {
            post.name = value;
            this.updateJsonPreview();
        });

        this.uiGenerator.createSelectorInput('Link Selector', container, 
            (value) => {
                post.linkSelector = value;
                this.updateJsonPreview();
                this._updatePostPreviews(post);
            }, 
            (input) => this.startElementSelection(input)
        );

        this.uiGenerator.createSelectorInput('Pagination Link Selector', container, 
            (value) => {
                post.paginationLinkSelector = value;
                this.updateJsonPreview();
                this._updatePostPreviews(post);
            }, 
            (input) => this.startElementSelection(input)
        );
    }

    _createPostPreviewElements(container, post) {
        this.postLinkPreview = this.uiGenerator.createElementPreview(container, 'Link Preview');
        this.postPaginationPreview = this.uiGenerator.createElementPreview(container, 'Pagination Link Preview');
    }

    _updatePostPreviews(post) {
        PreviewService.getElementInfo(
            post.linkSelector,
            null,
            null,
            this.postLinkPreview
        );

        PreviewService.getElementInfo(
            post.paginationLinkSelector,
            null,
            null,
            this.postPaginationPreview
        );
    }

    _createPostButtons(container, post) {
        const addFieldButton = this.uiGenerator.createButton('Add Field', 'add-button', () => {
            const newField = this.configManager.addFieldToPost(post, {});
            this.createField(container, newField);
        });
        container.appendChild(addFieldButton);

        const removeButton = this.uiGenerator.createButton('Remove Post', 'remove-button', () => {
            this.configManager.removePost(post);
            container.remove();
            this.updateJsonPreview();
        });
        container.appendChild(removeButton);
    }

    // Field Management
    createField(parent, field) {
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'field-container';
        
        this._createFieldInputs(fieldContainer, field);
        this._createFieldButtons(fieldContainer, field, parent);
        
        parent.appendChild(fieldContainer);
        return fieldContainer;
    }

    _createFieldInputs(container, field) {
        // Name input
        this.uiGenerator.createTextInput('Field Name', container, (value) => {
            field.name = value;
            this.updateJsonPreview();
        });

        // Value group
        const valueGroup = this._createFieldGroup(container, 'value', field);
        const nameGroup = this._createFieldGroup(container, 'name', field);
    }

    _createFieldGroup(container, type, field) {
        const group = document.createElement('div');
        group.className = `${type}-group`;
        container.appendChild(group);

        const preview = this.uiGenerator.createElementPreview(group, `${type.charAt(0).toUpperCase() + type.slice(1)} Preview`);

        this.uiGenerator.createSelectorInput(`${type.charAt(0).toUpperCase() + type.slice(1)} Selector`, group, 
            (value) => {
                field[`${type}Selector`] = value;
                this.updateJsonPreview();
                this._updateFieldPreview(field, preview, type);
            },
            (input) => this.startElementSelection(input)
        );

        this.uiGenerator.createTextInput(`${type.charAt(0).toUpperCase() + type.slice(1)} Attribute`, group, (value) => {
            field[`${type}Attribute`] = value;
            this.updateJsonPreview();
            this._updateFieldPreview(field, preview, type);
        });

        this.uiGenerator.createTextInput(`Regex ${type.charAt(0).toUpperCase() + type.slice(1)} filter`, group, (value) => {
            field[`${type}RegexFilter`] = value;
            this.updateJsonPreview();
            this._updateFieldPreview(field, preview, type);
        });

        return group;
    }

    _updateFieldPreview(field, previewElement, type) {
        const selector = field[`${type}Selector`];
        const attribute = field[`${type}Attribute`] ? 
            { type: `${type}Attribute`, value: field[`${type}Attribute`] } : 
            null;
        const regex = field[`${type}RegexFilter`] ? 
            new RegExp(field[`${type}RegexFilter`]) : 
            null;

        PreviewService.getElementInfo(selector, attribute, regex, previewElement);
    }

    _createFieldButtons(container, field, parent) {
        const addSubfieldButton = this.uiGenerator.createButton('Add Subfield', 'add-button', () => {
            if (!field.fields) field.fields = [];
            const newField = this.configManager.addFieldToPost(field, {});
            this.createField(container, newField);
        });
        container.appendChild(addSubfieldButton);

        const removeButton = this.uiGenerator.createButton('Remove Field', 'remove-button', () => {
            this.configManager.removeField(field);
            this.updateJsonPreview();
            container.remove();
        });
        container.appendChild(removeButton);
    }

    updateJsonPreview() {
        const jsonOutput = document.getElementById('jsonOutput');
        jsonOutput.textContent = JSON.stringify(this.configManager.getConfig(), null, 2);
    }
}

// Initialize the configuration generator when the panel loads
document.addEventListener('DOMContentLoaded', () => {
    new ConfigGenerator();
});
