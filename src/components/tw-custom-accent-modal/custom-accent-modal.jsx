import {defineMessages, FormattedMessage, intlShape, injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import Box from '../box/box.jsx';
import Modal from '../../containers/modal.jsx';
import styles from '../tw-custom-extension-modal/custom-extension-modal.css';
import {APP_NAME} from '../../lib/brand';

const messages = defineMessages({
    title: {
        defaultMessage: 'Custom Accent',
        description: 'Title of custom accent modal',
        id: 'tw.customAccentModal.title'
    }
});

const CustomAccentModal = props => (
    <Modal
        className={styles.modalContent}
        onRequestClose={props.onClose}
        contentLabel={props.intl.formatMessage(messages.title)}
        id="customAccentModal"
    >
        <Box className={styles.body}>
            <p>
                <FormattedMessage
                    defaultMessage="Choose a custom accent color for the GUI."
                    description="Label for custom accent modal"
                    id="tw.customAccentModal.prompt"
                />
            </p>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <input
                    aria-label="Custom accent color"
                    type="color"
                    value={props.color}
                    onChange={props.onChangeColor}
                />
                <input
                    type="text"
                    className={styles.urlInput}
                    value={props.color}
                    onChange={props.onChangeColor}
                />
                <div style={{width: 32, height: 24, borderRadius: 4, border: '1px solid #ccc', background: props.color}} />
            </div>

            <div className={styles.buttonRow} style={{marginTop: 18}}>
                <button
                    className={styles.loadButton}
                    onClick={props.onSave}
                >
                    <FormattedMessage
                        defaultMessage="Save"
                        id="tw.customAccentModal.save"
                    />
                </button>
                <button
                    className={styles.loadButton}
                    onClick={props.onClose}
                    style={{marginLeft: 8}}
                >
                    <FormattedMessage
                        defaultMessage="Cancel"
                        id="tw.customAccentModal.cancel"
                    />
                </button>
            </div>
        </Box>
    </Modal>
);

CustomAccentModal.propTypes = {
    intl: intlShape,
    color: PropTypes.string.isRequired,
    onChangeColor: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
};

export default injectIntl(CustomAccentModal);
