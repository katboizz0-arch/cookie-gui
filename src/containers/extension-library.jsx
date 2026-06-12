import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import VM from 'scratch-vm';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import log from '../lib/log';

import extensionLibraryContent, {
    galleryError,
    galleryLoading,
    galleryMore
} from '../lib/libraries/extensions/index.jsx';
import extensionTags from '../lib/libraries/tw-extension-tags';

import LibraryComponent from '../components/library/library.jsx';
import styles from '../components/library/library.css';
import extensionIcon from '../components/action-menu/icon--sprite.svg';

const messages = defineMessages({
    extensionTitle: {
        defaultMessage: 'Choose an Extension',
        description: 'Heading for the extension library',
        id: 'gui.extensionLibrary.chooseAnExtension'
    }
});

const toLibraryItem = extension => {
    if (typeof extension === 'object') {
        return ({
            rawURL: extension.iconURL || extensionIcon,
            ...extension
        });
    }
    return extension;
};

const translateGalleryItem = (extension, locale) => ({
    ...extension,
    name: extension.nameTranslations[locale] || extension.name,
    description: extension.descriptionTranslations[locale] || extension.description
});

let cachedGallery = null;

const fetchLibrary = async () => {
    const res = await fetch('https://extensions.turbowarp.org/generated-metadata/extensions-v0.json');
    if (!res.ok) {
        throw new Error(`HTTP status ${res.status}`);
    }
    const data = await res.json();
    return data.extensions.map(extension => ({
        name: extension.name,
        nameTranslations: extension.nameTranslations || {},
        description: extension.description,
        descriptionTranslations: extension.descriptionTranslations || {},
        extensionId: extension.id,
        extensionURL: `https://extensions.turbowarp.org/${extension.slug}.js`,
        iconURL: `https://extensions.turbowarp.org/${extension.image || 'images/unknown.svg'}`,
        tags: ['tw'],
        credits: [
            ...(extension.original || []),
            ...(extension.by || [])
        ].map(credit => {
            if (credit.link) {
                return (
                    <a
                        href={credit.link}
                        target="_blank"
                        rel="noreferrer"
                        key={credit.name}
                    >
                        {credit.name}
                    </a>
                );
            }
            return credit.name;
        }),
        docsURI: extension.docs ? `https://extensions.turbowarp.org/${extension.slug}` : null,
        samples: extension.samples ? extension.samples.map(sample => ({
            href: `${process.env.ROOT}editor?project_url=https://extensions.turbowarp.org/samples/${encodeURIComponent(sample)}.sb3`,
            text: sample
        })) : null,
        incompatibleWithScratch: !extension.scratchCompatible,
        featured: true
    }));
};

class ExtensionLibrary extends React.PureComponent {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleItemSelect',
            'handleRefreshExtension',
            'renderExtensionManagerSection'
        ]);
        this.state = {
            gallery: cachedGallery,
            galleryError: null,
            galleryTimedOut: false
        };
    }

    getLoadedExtensions () {
        const loadedURLs = this.props.vm.extensionManager.getExtensionURLs();
        if (!loadedURLs || !loadedURLs.length) {
            return [];
        }
        return loadedURLs.map(item => {
            const extension = extensionLibraryContent.find(ext => (
                ext.extensionId === item.extensionId || ext.extensionURL === item.extensionURL
            ));
            const displayName = extension ? extension.name : item.extensionId || item.extensionURL;
            return {
                ...item,
                displayName,
                docsURI: extension ? extension.docsURI : null
            };
        });
    }

    handleRefreshExtension (item) {
        if (!item || !item.extensionId) {
            return;
        }
        this.props.vm.extensionManager.refreshBlocks(item.extensionId)
            .catch(err => {
                log.error(err);
                // eslint-disable-next-line no-alert
                alert(err);
            });
    }

    renderExtensionManagerSection () {
        const loadedExtensions = this.getLoadedExtensions();
        if (!loadedExtensions.length) {
            return null;
        }

        return (
            <div className={styles.loadedExtensionsPanel}>
                <div className={styles.loadedExtensionsHeader}>
                    <div className={styles.loadedExtensionsTitle}>
                        {this.props.intl.formatMessage({
                            defaultMessage: 'Loaded extensions',
                            description: 'Heading for loaded extension manager section',
                            id: 'gui.extensionLibrary.loadedExtensionsTitle'
                        })}
                    </div>
                    <div className={styles.loadedExtensionsSubtitle}>
                        {this.props.intl.formatMessage({
                            defaultMessage: 'Manage currently loaded extensions and refresh block definitions.',
                            description: 'Subtitle text for loaded extension manager section',
                            id: 'gui.extensionLibrary.loadedExtensionsSubtitle'
                        })}
                    </div>
                </div>
                <div className={styles.loadedExtensionsList}>
                    {loadedExtensions.map(item => (
                        <div
                            className={styles.loadedExtensionItem}
                            key={item.extensionId || item.extensionURL}
                        >
                            <div className={styles.loadedExtensionInfo}>
                                <div className={styles.loadedExtensionName}>
                                    {item.displayName}
                                </div>
                                <div className={styles.loadedExtensionMeta}>
                                    {item.extensionId}
                                    {item.extensionURL && item.extensionURL !== item.extensionId ? (
                                        <span className={styles.loadedExtensionURL}>
                                            {' • '}{item.extensionURL}
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                            <div className={styles.loadedExtensionActions}>
                                <button
                                    type="button"
                                    className={styles.loadedExtensionButton}
                                    onClick={() => this.handleRefreshExtension(item)}
                                >
                                    {this.props.intl.formatMessage({
                                        defaultMessage: 'Refresh',
                                        description: 'Button text to refresh an extension',
                                        id: 'gui.extensionLibrary.refreshButton'
                                    })}
                                </button>
                                {item.docsURI && (
                                    <a
                                        href={item.docsURI}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={styles.loadedExtensionButton}
                                    >
                                        {this.props.intl.formatMessage({
                                            defaultMessage: 'Docs',
                                            description: 'Button text to open extension docs',
                                            id: 'gui.extensionLibrary.docsButton'
                                        })}
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    componentDidMount () {
        if (!this.state.gallery) {
            const timeout = setTimeout(() => {
                this.setState({
                    galleryTimedOut: true
                });
            }, 750);

            fetchLibrary()
                .then(gallery => {
                    cachedGallery = gallery;
                    this.setState({
                        gallery
                    });
                    clearTimeout(timeout);
                })
                .catch(error => {
                    log.error(error);
                    this.setState({
                        galleryError: error
                    });
                    clearTimeout(timeout);
                });
        }
    }
    handleItemSelect (item) {
        if (item.href) {
            return;
        }

        const extensionId = item.extensionId;

        if (extensionId === 'custom_extension') {
            this.props.onOpenCustomExtensionModal();
            return;
        }

        if (extensionId === 'procedures_enable_return') {
            this.props.onEnableProcedureReturns();
            this.props.onCategorySelected('myBlocks');
            return;
        }

        const url = item.extensionURL ? item.extensionURL : extensionId;
        if (!item.disabled) {
            if (this.props.vm.extensionManager.isExtensionLoaded(extensionId)) {
                this.props.onCategorySelected(extensionId);
            } else {
                this.props.vm.extensionManager.loadExtensionURL(url)
                    .then(() => {
                        this.props.onCategorySelected(extensionId);
                    })
                    .catch(err => {
                        log.error(err);
                        // eslint-disable-next-line no-alert
                        alert(err);
                    });
            }
        }
    }
    render () {
        let library = null;
        if (this.state.gallery || this.state.galleryError || this.state.galleryTimedOut) {
            library = extensionLibraryContent.map(extension => {
                const item = toLibraryItem(extension);
                return {
                    ...item,
                    loaded: item.extensionId && this.props.vm.extensionManager.isExtensionLoaded(item.extensionId)
                };
            });
            library.push('---');
            if (this.state.gallery) {
                library.push(toLibraryItem(galleryMore));
                const locale = this.props.intl.locale;
                library.push(
                    ...this.state.gallery
                        .filter(i => i.extensionId !== 'faceSensing')
                        .map(i => translateGalleryItem(i, locale))
                        .map(toLibraryItem)
                );
            } else if (this.state.galleryError) {
                library.push(toLibraryItem(galleryError));
            } else {
                library.push(toLibraryItem(galleryLoading));
            }
        }

        return (
            <LibraryComponent
                data={library}
                filterable
                persistableKey="extensionId"
                id="extensionLibrary"
                tags={extensionTags}
                title={this.props.intl.formatMessage(messages.extensionTitle)}
                topSection={this.renderExtensionManagerSection()}
                visible={this.props.visible}
                onItemSelected={this.handleItemSelect}
                onRequestClose={this.props.onRequestClose}
            />
        );
    }
}

ExtensionLibrary.propTypes = {
    intl: intlShape.isRequired,
    onCategorySelected: PropTypes.func,
    onEnableProcedureReturns: PropTypes.func,
    onOpenCustomExtensionModal: PropTypes.func,
    onRequestClose: PropTypes.func,
    visible: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired // eslint-disable-line react/no-unused-prop-types
};

export default injectIntl(ExtensionLibrary);
