import React, { useState } from 'react';
import { Dropdown, Modal, Button, Select, Input, Tooltip } from 'antd';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import PropTypes from 'prop-types';
import styles from './UserActions.module.css';

function UserActions({ user, currentUser, onActionComplete }) {
    const [selectedCategory, setSelectedCategory] = useState('Інше');
    const [messageContent, setMessageContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [error, setError] = useState('');
    const validateMessage = (message) => {
        if (message.trim().length >= 10) {
            setError('');
            return true;
        } else {
            setError('Повідомлення має бути не менше 10 символів.');
            return false;
        }
    };

    const handleSendMessage = async () => {
        if (!validateMessage(messageContent)) return;

        setIsSending(true);
        try {
            await axios.post(
                `${process.env.REACT_APP_BASE_API_URL}/api/admin/users/${user.id}/send_message/`,
                {
                    email: user.email,
                    category: selectedCategory,
                    message: messageContent.trim(),
                }
            );
            toast.success('Повідомлення успішно надіслано');
            setMessageContent('');
            setIsModalVisible(false);
            if (onActionComplete) onActionComplete();
        } catch {
            toast.error('Не вдалося надіслати повідомлення. Спробуйте ще раз.');
        } finally {
            setIsSending(false);
        }
    };

    const removeStaffStatus = async () => {
        try {
            await axios.put(`${process.env.REACT_APP_BASE_API_URL}/api/admin/users/${user.id}/remove_staff/`, {});
            if (onActionComplete) onActionComplete();
        } catch (error) {
            toast.error('Не вдалося забрати права адміністратора.');
        }
    };

    const menuItems = [
        {
            key: 'sendMessage',
            label: (
                <Tooltip title="Відправити повідомлення на email">
                    Надіслати листа
                </Tooltip>
            ),
            onClick: () => setIsModalVisible(true),
        },
        currentUser.isStaff && user.status.is_staff ?
        {
            key: 'viewProfile',
            label: (
                <Tooltip title="Забрати права адміністратора">
                    Забрати права адміністратора
                </Tooltip>
            ),
            onClick: removeStaffStatus,
        } : null,
    ].filter(Boolean);

    return (
        <>
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                <Button>Обрати</Button>
            </Dropdown>
            <Modal
                title={`Надіслати листа користувачу ${user.name} ${user.surname}`}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setError('');
                    setMessageContent('');
                }}
                footer={[
                    <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                        Відмінити
                    </Button>,
                    <Button
                        key="send"
                        type="primary"
                        loading={isSending}
                        onClick={handleSendMessage}
                    >
                        Відправити
                    </Button>,
                ]}
                width={600}
            >
                <div className={styles.userActionsModalContent}>
                    <Input
                        value={user.email}
                        readOnly
                        className={styles.userActionsInput}
                        addonBefore="Email"
                    />
                    <Select
                        defaultValue="Інше"
                        className={styles.userActionsSelect}
                        onChange={(value) => setSelectedCategory(value)}
                        options={[
                            { value: 'Технічне питання', label: 'Технічне питання' },
                            { value: 'Рекомендації', label: 'Рекомендації' },
                            { value: 'Питання', label: 'Питання' },
                            { value: 'Інше', label: 'Інше' },
                        ]}
                    />
                    <Input.TextArea
                        rows={6}
                        placeholder="Введіть ваше повідомлення..."
                        value={messageContent}
                        onChange={(e) => {
                            const input = e.target.value;
                            setMessageContent(input);
                            validateMessage(input);
                        }}
                        className={styles.userActionsTextarea}
                    />
                    {error && <p className={styles.userActionsError}>{error}</p>}
                </div>
            </Modal>
        </>
    );
}

UserActions.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        surname: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
    }).isRequired,
    onActionComplete: PropTypes.func,
};

export default UserActions;
