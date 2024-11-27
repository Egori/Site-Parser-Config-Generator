class ConfigManager {
    constructor() {
        this.config = {
            main_url: '',
            catalog: [],
            posts: []
        };
    }

    setMainUrl(url) {
        this.config.main_url = url;
    }

    addCatalog(catalogData) {
        const catalog = {
            name: catalogData.name || '',
            fields: [],
            childCatalogName: catalogData.childCatalogName || '',
            linkSelector: catalogData.linkSelector || '',
            childPostName: catalogData.childPostName || '',
            isMain: catalogData.isMain || false,
            paginationLinkSelector: catalogData.paginationLinkSelector || ''
        };
        this.config.catalog.push(catalog);
        return catalog;
    }

    addPost(postData) {
        const post = {
            name: postData.name || '',
            fields: [],
            linkSelector: postData.linkSelector || '',
            paginationLinkSelector: postData.paginationLinkSelector || '',
            catalogs: []
        };
        this.config.posts.push(post);
        return post;
    }

    addFieldToCatalog(catalog, fieldData) {
        const field = {
            name: fieldData.name || '',
            valueSelector: fieldData.valueSelector || '',
            valueAttribute: fieldData.valueAttribute || '',
            nameSelector: fieldData.nameSelector || '',
            nameAttribute: fieldData.nameAttribute || '',
            regexFilter: fieldData.regexFilter || ''
        };
        catalog.fields.push(field);
        return field;
    }

    addFieldToPost(post, fieldData) {
        const field = {
            name: fieldData.name || '',
            valueSelector: fieldData.valueSelector || '',
            valueAttribute: fieldData.valueAttribute || '',
            nameSelector: fieldData.nameSelector || '',
            nameAttribute: fieldData.nameAttribute || '',
            regexFilter: fieldData.regexFilter || ''
        };
        post.fields.push(field);
        return field;
    }

    addCatalogReferenceToPost(post, catalogRefData) {
        const catalogRef = {
            catalogNameSelector: catalogRefData.catalogNameSelector || '',
            catalogValueSelector: catalogRefData.catalogValueSelector || '',
            catalogName: catalogRefData.catalogName || ''
        };
        post.catalogs.push(catalogRef);
        return catalogRef;
    }

    removeCatalog(catalog) {
        const index = this.config.catalog.indexOf(catalog);
        if (index > -1) {
            this.config.catalog.splice(index, 1);
        }
    }

    removePost(post) {
        const index = this.config.posts.indexOf(post);
        if (index > -1) {
            this.config.posts.splice(index, 1);
        }
    }

    removeField(field) {
        function removeFieldFromArray(array, field) {
            const index = array.indexOf(field);
            if (index !== -1) {
                array.splice(index, 1);
            }
        }

        function recursivelyRemoveField(fieldsArray, fieldToRemove) {
            removeFieldFromArray(fieldsArray, fieldToRemove);
            fieldsArray.forEach(field => {
                if (field.fields) {
                    recursivelyRemoveField(field.fields, fieldToRemove);
                }
            });
        }

        if (this.config.catalog) {
            this.config.catalog.forEach(catalog => {
                if (catalog.fields) {
                    recursivelyRemoveField(catalog.fields, field);
                }
            });
        }

        if (this.config.posts) {
            this.config.posts.forEach(post => {
                if (post.fields) {
                    recursivelyRemoveField(post.fields, field);
                }
            });
        }
    }

    getConfig() {
        return this.config;
    }

    getJsonString() {
        return JSON.stringify(this.config, null, 2);
    }

    downloadConfig() {
        const jsonString = this.getJsonString();
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'parser-config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
