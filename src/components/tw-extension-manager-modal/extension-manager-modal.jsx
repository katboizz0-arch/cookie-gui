import {defineMessages, FormattedMessage, intlShape, injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import Box from '../box/box.jsx';
import Modal from '../../containers/modal.jsx';
import styles from './extension-manager-modal.css';

const messages = defineMessages({
    title: {
        defaultMessage: 'Extension Manager',
        description: 'Title of extension manager modal',
        id: 'tw.extensionManagerModal.title'
    },
    description: {
        defaultMessage: 'Review extensions loaded into the editor and refresh their block definitions.',
        description: 'Description text shown in extension manager modal',
        id: 'tw.extensionManagerModal.description'
    },
    noExtensions: {
        defaultMessage: 'No extensions are currently loaded.',
        description: 'Text when no extensions are loaded in extension manager modal',
        id: 'tw.extensionManagerModal.noExtensions'
    },
    refresh: {
        defaultMessage: 'Refresh',
        description: 'Button label to refresh a loaded extension',
        id: 'tw.extensionManagerModal.refresh'
    },
    delete: {
        defaultMessage: 'Remove',
        description: 'Button label to remove a loaded extension',
        id: 'tw.extensionManagerModal.delete'
    },
    refreshAll: {
        defaultMessage: 'Refresh All',
        description: 'Button label to refresh all loaded extensions',
        id: 'tw.extensionManagerModal.refreshAll'
    },
    close: {
        defaultMessage: 'Close',
        description: 'Button label to close the extension manager',
        id: 'tw.extensionManagerModal.close'
    }
});

const ExtensionManagerModal = props => (
    <Modal
        className={styles.modalContent}
        onRequestClose={props.onClose}
        contentLabel={props.intl.formatMessage(messages.title)}
        id="extensionManagerModal"
    >
        <Box className={styles.body}>
            <p>{props.intl.formatMessage(messages.description)}</p>
            {props.extensions.length ? (
                <React.Fragment>
                    <div className={styles.controls}>
                        <button
                            type="button"
                            className={styles.loadButton}
                            onClick={props.onRefreshAll}
                        >
                            {props.intl.formatMessage(messages.refreshAll)}
                        </button>
                    </div>
                    <div className={styles.extensionList}>
                        {props.extensions.map((extension, index) => (
                            <div key={`${extension.extensionId || extension.extensionURL}-${index}`} className={styles.extensionItem}>
                                <div className={styles.extensionDetails}>
                                    <div className={styles.extensionName}>
                                        {extension.displayName}
                                    </div>
                                    <div className={styles.extensionMeta}>
                                        {extension.extensionId || extension.extensionURL}
                                    </div>
                                    {extension.extensionURL && extension.extensionURL !== extension.extensionId && (
                                        <div className={styles.extensionUrl}>
                                            {extension.extensionURL}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.extensionActions}>
                                    <button
                                        type="button"
                                        className={styles.loadButton}
                                        onClick={() => props.onRefreshExtension(extension)}
                                        disabled={!extension.extensionId}
                                    >
                                        {props.intl.formatMessage(messages.refresh)}
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.loadButton}
                                        onClick={() => props.onDeleteExtension(extension)}
                                        disabled={!extension.extensionId}
                                    >
                                        {props.intl.formatMessage(messages.delete)}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </React.Fragment>
            ) : (
                <p>{props.intl.formatMessage(messages.noExtensions)}</p>
            )}
            <div className={styles.buttonRow}>
                <button
                    type="button"
                    className={styles.loadButton}
                    onClick={props.onClose}
                >
                    {props.intl.formatMessage(messages.close)}
                </button>
            </div>
        </Box>
    </Modal>
);

ExtensionManagerModal.propTypes = {
    intl: intlShape,
    extensions: PropTypes.arrayOf(PropTypes.shape({
        extensionId: PropTypes.string,
        extensionURL: PropTypes.string,
        displayName: PropTypes.string
    })),
    onClose: PropTypes.func.isRequired,
    onRefreshExtension: PropTypes.func.isRequired,
    onRefreshAll: PropTypes.func.isRequired,
    onDeleteExtension: PropTypes.func.isRequired
};

ExtensionManagerModal.defaultProps = {
    extensions: []
};

export default injectIntl(ExtensionManagerModal);
