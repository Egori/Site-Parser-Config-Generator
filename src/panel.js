class ConfigGenerator {
    constructor() {
        this.uiGenerator = new UIGenerator();
        this.configManager = new ConfigManager();
        this.activeInput = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('mainUrl').addEventListener('input', (e) => {
            this.configManager.setMainUrl(e.target.value);
            this.updateJsonPreview();
        });

        document.getElementById('addCatalog').addEventListener('click', () => this.addCatalog());
        document.getElementById('addPost').addEventListener('click', () => this.addPost());
        document.getElementById('generateJson').addEventListener('click', () => this.updateJsonPreview());
        document.getElementById('downloadJson').addEventListener('click', () => this.configManager.downloadConfig());

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

    addCatalog() {
        const catalogList = document.getElementById('catalogList');
        const catalogContainer = document.createElement('div');
        catalogContainer.className = 'config-item';

        const catalog = this.configManager.addCatalog({});

        const nameInput = this.uiGenerator.createTextInput('Catalog Name', catalogContainer, (value) => {
            catalog.name = value;
            this.updateJsonPreview();
        });

        // Link Selector with preview
        const linkSelectorInput = this.uiGenerator.createSelectorInput('Link Selector', catalogContainer, 
            (value) => {
                catalog.linkSelector = value;
                this.updateJsonPreview();
                updateLinkPreview();
            }, 
            (input) => this.startElementSelection(input)
        );

        // Create preview for Link Selector
        const linkPreview = this.uiGenerator.createElementPreview(catalogContainer, 'Link Preview');

        const childCatalogInput = this.uiGenerator.createTextInput('Child Catalog Name', catalogContainer, (value) => {
            catalog.childCatalogName = value;
            this.updateJsonPreview();
        });

        const childPostInput = this.uiGenerator.createTextInput('Child Post Name', catalogContainer, (value) => {
            catalog.childPostName = value;
            this.updateJsonPreview();
        });

        // Pagination Link Selector with preview
        const paginationInput = this.uiGenerator.createSelectorInput('Pagination Link Selector', catalogContainer, 
            (value) => {
                catalog.paginationLinkSelector = value;
                this.updateJsonPreview();
                updatePaginationPreview();
            }, 
            (input) => this.startElementSelection(input)
        );

        // Create preview for Pagination Link Selector
        const paginationPreview = this.uiGenerator.createElementPreview(catalogContainer, 'Pagination Link Preview');

        // Preview update functions
        const updateLinkPreview = () => {
            this.getElementInfo(
                catalog.linkSelector,
                null,
                null,
                linkPreview
            );
        };

        const updatePaginationPreview = () => {
            this.getElementInfo(
                catalog.paginationLinkSelector,
                null,
                null,
                paginationPreview
            );
        };

        const isMainCheckbox = this.uiGenerator.createCheckbox('Is Main Catalog', catalogContainer, (checked) => {
            catalog.isMain = checked;
            this.updateJsonPreview();
        });

        const addFieldButton = this.uiGenerator.createButton('Add Field', 'add-button', () => {
            const newField = this.configManager.addFieldToCatalog(catalog, {});
            this.createField(catalogContainer, newField);
        });
        catalogContainer.appendChild(addFieldButton);

        const removeButton = this.uiGenerator.createButton('Remove Catalog', 'remove-button', () => {
            this.configManager.removeCatalog(catalog);
            catalogContainer.remove();
            this.updateJsonPreview();
        });
        catalogContainer.appendChild(removeButton);

        catalogList.appendChild(catalogContainer);
    }

    addPost() {
        const postList = document.getElementById('postList');
        const postContainer = document.createElement('div');
        postContainer.className = 'config-item';

        const post = this.configManager.addPost({});

        const nameInput = this.uiGenerator.createTextInput('Post Name', postContainer, (value) => {
            post.name = value;
            this.updateJsonPreview();
        });

        // Link Selector with preview
        const linkSelectorInput = this.uiGenerator.createSelectorInput('Link Selector', postContainer, 
            (value) => {
                post.linkSelector = value;
                this.updateJsonPreview();
                updateLinkPreview();
            }, 
            (input) => this.startElementSelection(input)
        );

        // Create preview for Link Selector
        const linkPreview = this.uiGenerator.createElementPreview(postContainer, 'Link Preview');

        // Pagination Link Selector with preview
        const paginationInput = this.uiGenerator.createSelectorInput('Pagination Link Selector', postContainer, 
            (value) => {
                post.paginationLinkSelector = value;
                this.updateJsonPreview();
                updatePaginationPreview();
            }, 
            (input) => this.startElementSelection(input)
        );

        // Create preview for Pagination Link Selector
        const paginationPreview = this.uiGenerator.createElementPreview(postContainer, 'Pagination Link Preview');

        // Preview update functions
        const updateLinkPreview = () => {
            this.getElementInfo(post.linkSelector, null, null, linkPreview);
        };

        const updatePaginationPreview = () => {
            this.getElementInfo(post.paginationLinkSelector, null, null, paginationPreview);
        };

        const addFieldButton = this.uiGenerator.createButton('Add Field', 'add-button', () => {
            const newField = this.configManager.addFieldToPost(post, {});
            this.createField(postContainer, newField);
        });
        postContainer.appendChild(addFieldButton);

        // const addCatalogRefButton = this.uiGenerator.createButton('Add Catalog Reference', 'add-button', () => {
        //     const catalogRef = this.configManager.addCatalogReferenceToPost(post, {});
        //     this.createCatalogReference(postContainer, catalogRef);
        // });
        // postContainer.appendChild(addCatalogRefButton);

        const removeButton = this.uiGenerator.createButton('Remove Post', 'remove-button', () => {
            this.configManager.removePost(post);
            postContainer.remove();
            this.updateJsonPreview();
        });
        postContainer.appendChild(removeButton);

        postList.appendChild(postContainer);
    }

    createField(parent, field) {
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'field-container';
        parent.appendChild(fieldContainer);

        // Field Name input
        const nameInput = this.uiGenerator.createTextInput('Field Name', fieldContainer, (value) => {
            field.name = value;
            this.updateJsonPreview();
        });

        // Group for Value
        const valueGroup = document.createElement('div');
        valueGroup.className = 'value-group';
        fieldContainer.appendChild(valueGroup);

        const valueSelectorInput = this.uiGenerator.createSelectorInput('Value Selector', valueGroup, 
            (value) => {
                field.valueSelector = value;
                this.updateJsonPreview();
                updatePreview();
            },
            (input) => this.startElementSelection(input)
        );

        const valueAttributeInput = this.uiGenerator.createTextInput('Value Attribute', valueGroup, (value) => {
            field.valueAttribute = value;
            this.updateJsonPreview();
            updatePreview();
        });

        const valueRegexFilterInput = this.uiGenerator.createTextInput('Regex Value filter', valueGroup, (value) => {
            field.valueRegexFilter = value;
            this.updateJsonPreview();
            updatePreview();
        });

        // Create preview for Value group
        const valuePreview = this.uiGenerator.createElementPreview(valueGroup, 'Value Preview');

        // Group for Name
        const nameGroup = document.createElement('div');
        nameGroup.className = 'name-group';
        fieldContainer.appendChild(nameGroup);

        const nameSelectorInput = this.uiGenerator.createSelectorInput('Name Selector', nameGroup, 
            (value) => {
                field.nameSelector = value;
                this.updateJsonPreview();
                updatePreview();
            },
            (input) => this.startElementSelection(input)
        );

        const nameAttributeInput = this.uiGenerator.createTextInput('Name Attribute', nameGroup, (value) => {
            field.nameAttribute = value;
            this.updateJsonPreview();
            updatePreview();
        });

        const nameRegexFilterInput = this.uiGenerator.createTextInput('Regex Name filter', nameGroup, (value) => {
            field.nameRegexFilter = value;
            this.updateJsonPreview();
            updatePreview();
        });

        // Create preview for Name group
        const namePreview = this.uiGenerator.createElementPreview(nameGroup, 'Name Preview');

        // Update preview logic
        const updatePreview = () => {
            const valueSelector = field.valueSelector;
            const nameSelector = field.nameSelector;
            const valueRegex = field.valueRegexFilter ? new RegExp(field.valueRegexFilter) : null;
            const nameRegex = field.nameRegexFilter ? new RegExp(field.nameRegexFilter) : null;

            // Update Value preview
            this.getElementInfo(
                valueSelector,
                field.valueAttribute ? { type: 'valueAttribute', value: field.valueAttribute } : null,
                valueRegex,
                valuePreview
            );

            // Update Name preview
            this.getElementInfo(
                nameSelector,
                field.nameAttribute ? { type: 'nameAttribute', value: field.nameAttribute } : null,
                nameRegex,
                namePreview
            );
        };

        const addSubfieldButton = this.uiGenerator.createButton('Add Subfield', 'add-button', () => {
            if (!field.fields) field.fields = [];
            const newField = this.configManager.addFieldToPost(field, {});
            this.createField(fieldContainer, newField);
        });
        fieldContainer.appendChild(addSubfieldButton);

        const removeButton = this.uiGenerator.createButton('Remove Field', 'remove-button', () => {
            this.configManager.removeField(field);
            this.updateJsonPreview();
            fieldContainer.remove();
        });
        fieldContainer.appendChild(removeButton);

        return fieldContainer;
    }

    createCatalogReference(parent, catalogRef) {
        const container = document.createElement('div');
        container.className = 'config-item';

        const catalogNameSelectorInput = this.uiGenerator.createSelectorInput('Catalog Name Selector', container, 
            (value) => {
                catalogRef.catalogNameSelector = value;
                this.updateJsonPreview();
            },
            (input) => this.startElementSelection(input)
        );

        const catalogValueSelectorInput = this.uiGenerator.createSelectorInput('Catalog Value Selector', container, 
            (value) => {
                catalogRef.catalogValueSelector = value;
                this.updateJsonPreview();
            },
            (input) => this.startElementSelection(input)
        );

        const catalogNameInput = this.uiGenerator.createTextInput('Catalog Name', container, (value) => {
            catalogRef.catalogName = value;
            this.updateJsonPreview();
        });

        // const removeButton = this.uiGenerator.createButton('Remove Catalog Reference', 'remove-button', () => {
        //     container.remove();
        //     const index = parent.post.catalogs.indexOf(catalogRef);
        //     if (index > -1) {
        //         parent.post.catalogs.splice(index, 1);
        //     }
        //     this.updateJsonPreview();
        // });
        // container.appendChild(removeButton);

        parent.appendChild(container);
        return container;
    }

    sendMessageToActiveTab(message, callback) {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, message, callback);
            }
        });
    }

    startElementSelection(input) {
        this.activeInput = input;
        try {
            this.sendMessageToActiveTab({type: 'START_SELECTING'});
        } catch (error) {
            console.error('Error sending message to tab:', error);
        }
    }

    getElementInfo(selector, attribute, regex, previewElement) {
        if (!selector) return;

        this.sendMessageToActiveTab({
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

    handleElementSelected(data) {
        if (this.activeInput) {
            this.activeInput.value = data.selector;
            // Trigger the input event to update the configuration
            const event = new Event('input', {
                bubbles: true,
                cancelable: true,
            });
            this.activeInput.dispatchEvent(event);
            
            // Reset the active input
            this.activeInput = null;
        }
    }

    updateJsonPreview() {
        const jsonOutput = document.getElementById('jsonOutput');
        jsonOutput.textContent = this.configManager.getJsonString();
    }
}

// Initialize the configuration generator when the panel loads
document.addEventListener('DOMContentLoaded', () => {
    new ConfigGenerator();
});
