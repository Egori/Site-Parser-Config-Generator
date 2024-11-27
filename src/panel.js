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

        const linkSelectorInput = this.uiGenerator.createSelectorInput('Link Selector', catalogContainer, 
            (value) => {
                catalog.linkSelector = value;
                this.updateJsonPreview();
            }, 
            (input) => {
                this.activeInput = input;
                try {
                    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                        chrome.tabs.sendMessage(tabs[0].id, {type: 'START_SELECTING'});
                    });
                } catch (error) {
                    console.error('Error sending message to tab:', error);
                }
            }
        );

        const childCatalogInput = this.uiGenerator.createTextInput('Child Catalog Name', catalogContainer, (value) => {
            catalog.childCatalogName = value;
            this.updateJsonPreview();
        });

        const childPostInput = this.uiGenerator.createTextInput('Child Post Name', catalogContainer, (value) => {
            catalog.childPostName = value;
            this.updateJsonPreview();
        });

        const paginationInput = this.uiGenerator.createSelectorInput('Pagination Link Selector', catalogContainer, 
            (value) => {
                catalog.paginationLinkSelector = value;
                this.updateJsonPreview();
            }, 
            (input) => {
                this.activeInput = input;
                try {
                    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                        chrome.tabs.sendMessage(tabs[0].id, {type: 'START_SELECTING'});
                    });
                } catch (error) {
                    console.error('Error sending message to tab:', error);
                }
            }
        );

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

        const linkSelectorInput = this.uiGenerator.createSelectorInput('Link Selector', postContainer, 
            (value) => {
                post.linkSelector = value;
                this.updateJsonPreview();
            }, 
            (input) => {
                this.activeInput = input;
                try {
                    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                        chrome.tabs.sendMessage(tabs[0].id, {type: 'START_SELECTING'});
                    });
                } catch (error) {
                    console.error('Error sending message to tab:', error);
                }
            }
        );

        const paginationInput = this.uiGenerator.createSelectorInput('Pagination Link Selector', postContainer, 
            (value) => {
                post.paginationLinkSelector = value;
                this.updateJsonPreview();
            }, 
            (input) => {
                this.activeInput = input;
                try {
                    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                        chrome.tabs.sendMessage(tabs[0].id, {type: 'START_SELECTING'});
                    });
                } catch (error) {
                    console.error('Error sending message to tab:', error);
                }
            }
        );

        const addFieldButton = this.uiGenerator.createButton('Add Field', 'add-button', () => {
            const newField = this.configManager.addFieldToPost(post, {});
            this.createField(postContainer, newField);
        });
        postContainer.appendChild(addFieldButton);

        const addCatalogButton = this.uiGenerator.createButton('Add Catalog Reference', 'add-button', () => {
            const catalogRef = this.configManager.addCatalogReferenceToPost(post, {});
            this.createCatalogReference(postContainer, catalogRef);
        });
        postContainer.appendChild(addCatalogButton);

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
        fieldContainer.className = 'config-item';

        const nameInput = this.uiGenerator.createTextInput('Field Name', fieldContainer, (value) => {
            field.name = value;
            this.updateJsonPreview();
        });

        const valueSelectorInput = this.uiGenerator.createSelectorInput('Value Selector', fieldContainer, 
            (value) => {
                field.valueSelector = value;
                this.updateJsonPreview();
            },
            (input) => {
                this.activeInput = input;
                try {
                    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                        chrome.tabs.sendMessage(tabs[0].id, {type: 'START_SELECTING'});
                    });
                } catch (error) {
                    console.error('Error sending message to tab:', error);
                }
            }
        );

        const valueAttributeInput = this.uiGenerator.createTextInput('Value Attribute', fieldContainer, (value) => {
            field.valueAttribute = value;
            this.updateJsonPreview();
        });

        const nameSelectorInput = this.uiGenerator.createSelectorInput('Name Selector', fieldContainer, 
            (value) => {
                field.nameSelector = value;
                this.updateJsonPreview();
            },
            (input) => {
                this.activeInput = input;
                try {
                    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                        chrome.tabs.sendMessage(tabs[0].id, {type: 'START_SELECTING'});
                    });
                } catch (error) {
                    console.error('Error sending message to tab:', error);
                }
            }
        );

        const nameAttributeInput = this.uiGenerator.createTextInput('Name Attribute', fieldContainer, (value) => {
            field.nameAttribute = value;
            this.updateJsonPreview();
        });

        const regexFilterInput = this.uiGenerator.createTextInput('Regex Filter', fieldContainer, (value) => {
            field.regexFilter = value;
            this.updateJsonPreview();
        });

        const addSubfieldButton = this.uiGenerator.createButton('Add Subfield', 'add-button', () => {
            if (!field.fields) field.fields = [];
            const newField = {};
            field.fields.push(newField);
            this.createField(fieldContainer, newField);
        });
        fieldContainer.appendChild(addSubfieldButton);

        const removeButton = this.uiGenerator.createButton('Remove Field', 'remove-button', () => {
            this.configManager.removeField(field);
            this.updateJsonPreview();
            fieldContainer.remove();
        });
        fieldContainer.appendChild(removeButton);

        parent.appendChild(fieldContainer);
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
            (input) => {
                this.activeInput = input;
                try {
                    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                        chrome.tabs.sendMessage(tabs[0].id, {type: 'START_SELECTING'});
                    });
                } catch (error) {
                    console.error('Error sending message to tab:', error);
                }
            }
        );

        const catalogValueSelectorInput = this.uiGenerator.createSelectorInput('Catalog Value Selector', container, 
            (value) => {
                catalogRef.catalogValueSelector = value;
                this.updateJsonPreview();
            },
            (input) => {
                this.activeInput = input;
                try {
                    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                        chrome.tabs.sendMessage(tabs[0].id, {type: 'START_SELECTING'});
                    });
                } catch (error) {
                    console.error('Error sending message to tab:', error);
                }
            }
        );

        const catalogNameInput = this.uiGenerator.createTextInput('Catalog Name', container, (value) => {
            catalogRef.catalogName = value;
            this.updateJsonPreview();
        });

        const removeButton = this.uiGenerator.createButton('Remove Catalog Reference', 'remove-button', () => {
            container.remove();
            const index = parent.post.catalogs.indexOf(catalogRef);
            if (index > -1) {
                parent.post.catalogs.splice(index, 1);
            }
            this.updateJsonPreview();
        });
        container.appendChild(removeButton);

        parent.appendChild(container);
        return container;
    }

    handleElementSelected(data) {
        if (this.activeInput) {
            this.activeInput.value = data.selector;
            this.activeInput.dispatchEvent(new Event('input'));
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
