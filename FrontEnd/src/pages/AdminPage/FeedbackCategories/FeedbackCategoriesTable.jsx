import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import useSWR, { mutate } from 'swr';
import { Table, Pagination, Input, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

import FeedbackCategoryActions from './FeedbackCategoryActions';
import FeedbackCategoryAdd from './FeedbackCategoryAdd';
import { DEFAULT_PAGE_SIZE } from '../constants';

import css from './FeedbackCategoriesTable.module.scss';

function FeedbackCategoriesTable() {
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(useLocation().search);
    const [currentPage, setCurrentPage] = useState(Number(queryParams.get('page')) || 1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [sortInfo, setSortInfo] = useState({ field: null, order: null });
    const [searchText, setSearchText] = useState('');

    const generateUrl = useMemo(() => {
        const ordering = sortInfo.field
            ? `&ordering=${sortInfo.order === 'ascend' ? sortInfo.field : '-' + sortInfo.field}`
            : '&ordering=name';
        const search = searchText ? `&name=${searchText}` : '';

        return `${process.env.REACT_APP_BASE_API_URL}/api/admin/feedback-categories?page=${currentPage}` +
            `&page_size=${pageSize}${ordering}${search}`;
    }, [currentPage, pageSize, sortInfo, searchText]);

    const fetcher = async (url) => {
        const response = await axios.get(url);
        return response.data;
    };

    const { data, isValidating: loading } = useSWR(generateUrl, fetcher);

    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
        queryParams.set('page', page);
        navigate(`?${queryParams.toString()}`);
    };

    const handleTableChange = (pagination, filters, sorter) => {
        if (sorter.field) {
            setSortInfo({ field: sorter.field, order: sorter.order });
        } else {
            setSortInfo({ field: null, order: null });
        }
    };

    const getColumnSearchProps = () => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div className={css['feedback-search-dropdown']}>
                <Input
                    placeholder="Пошук"
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => {
                        confirm();
                        setSearchText(selectedKeys[0]);
                    }}
                    className={css['feedback-search-input']}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => {
                            confirm();
                            setSearchText(selectedKeys[0]);
                        }}
                        icon={<SearchOutlined />}
                        size="small"
                        className={css['feedback-search-btn']}
                    >
                        Пошук
                    </Button>
                    <Button
                        onClick={() => {
                            clearFilters();
                            setSearchText('');
                        }}
                        size="small"
                        className={css['feedback-clear-btn']}
                    >
                        Скинути
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined className={filtered ? css['feedback-filtered-icon'] : css['feedback-icon']} />,
        render: (text) =>
            searchText ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text || ''}
                />
            ) : (
                text
            ),
    });

    const columns = [
        {
            title: 'Категорія фідбеку',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            sortOrder: sortInfo.field === 'name' ? sortInfo.order : null,
            ...getColumnSearchProps('name'),
        },
        {
            title: 'Дія',
            key: 'actions',
            align: 'center',
            render: (_, category) => (
                <FeedbackCategoryActions
                    category={category}
                    onActionComplete={() => {
                        mutate(generateUrl);
                    }}
                />
            ),
        },
    ];

    return (
        <div className={css['feedback-table-container']}>
            <Pagination
                showSizeChanger
                current={currentPage}
                pageSize={pageSize}
                total={data?.total_items || 0}
                onChange={handlePageChange}
                className={css['feedback-pagination']}
            />
            <Table
                columns={columns}
                dataSource={data?.results || []}
                onChange={handleTableChange}
                pagination={false}
                loading={loading}
                rowKey={(record) => record.id}
                tableLayout="fixed"
            />
            <Pagination
                showSizeChanger
                current={currentPage}
                pageSize={pageSize}
                total={data?.total_items || 0}
                onChange={handlePageChange}
                className={css['feedback-pagination']}
            />
            <FeedbackCategoryAdd />
        </div>
    );
}

export default FeedbackCategoriesTable;
