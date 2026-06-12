import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {MenuItem} from '../menu/menu.jsx';
import styles from './settings-menu.css';

const TWExtensionManagerSettings = props => (
    <MenuItem onClick={props.onClick}>
        <div className={styles.option}>
            <FormattedMessage
                defaultMessage="Extension Manager"
                description="Button in menu bar under settings to open the extension manager"
                id="tw.menuBar.extensionManager"
            />
        </div>
    </MenuItem>
);

TWExtensionManagerSettings.propTypes = {
    onClick: PropTypes.func
};

export default TWExtensionManagerSettings;
