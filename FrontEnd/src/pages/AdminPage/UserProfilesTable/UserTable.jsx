import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Highlighter from 'react-highlight-words';
import axios from 'axios';
import useSWR, { mutate }from 'swr';
import { Table, Tag, Tooltip, Pagination, Input, Button, Space } from 'antd';
import { CaretUpOutlined, CaretDownOutlined, SearchOutlined } from '@ant-design/icons';
import css from './UserTable.module.scss';
import UserActions from './UserActions';


const LENGTH_EMAIL = 14;
const DEFAULT_PAGE_SIZE = 10;

function UserTable() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const pageNumber = Number(queryParams.get('page')) || 1;
    const [currentPage, setCurrentPage] = useState(pageNumber);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [sortInfo, setSortInfo] = useState({ field: null, order: null });
    const [statusFilters, setStatusFilters] = useState([]);
    const [searchParams, setSearchParams] = useState({});

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const updatedPageNumber = Number(queryParams.get('page')) || 1;
        setCurrentPage(updatedPageNumber);
    }, [location.search]);

    const ordering = sortInfo.field ? `&ordering=${sortInfo.order === 'ascend' ? sortInfo.field : '-' + sortInfo.field}` : '';
    const filtering = statusFilters ? statusFilters.map((filter) => `&${filter}=true`).join('') : '';
    const query = new URLSearchParams(searchParams).toString();
    const url = `${process.env.REACT_APP_BASE_API_URL}/api/admin/users?page=${currentPage}&page_size=${pageSize}${ordering}${filtering}&${query}`;

    async function fetcher(url) {
        const response = await axios.get(url);
        return response.data;
    }
    const { data, isValidating: loading } = useSWR(url, fetcher);
    const users = data ? data.results : [];
    const totalItems = data ? data.total_items : 0;

    const updateQueryParams = (newPage) => {
        queryParams.set('page', newPage);
        navigate(`?${queryParams.toString()}`);
    };

    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
        updateQueryParams(page);
    };

    const handleTableChange = (pagination, filters, sorter) => {
        if (sorter.field) {
            const newSortInfo =
                sorter.order === null || sorter.order === undefined
                    ? { field: null, order: null }
                    : { field: sorter.field, order: sorter.order };

            setSortInfo(newSortInfo);
        } else {
            setSortInfo({ field: null, order: null });
        }

        setStatusFilters(filters.status);
        setCurrentPage(1);
        updateQueryParams(1);
    };

    const getSortIcon = (sortOrder) => {
        if (!sortOrder) return <span className={css['empty-icon']} />;
        return sortOrder === 'ascend' ? (
            <CaretUpOutlined className={css['icon']} />
        ) : (
            <CaretDownOutlined className={css['icon']} />
        );
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();

        if (selectedKeys[0]) {
          setSearchParams((prev) => ({ ...prev, [dataIndex]: selectedKeys[0] }));
        } else {
          setSearchParams((prev) => {
            const updatedParams = { ...prev };
            delete updatedParams[dataIndex];
            return updatedParams;
          });
        }
      };

    const handleReset = (clearFilters, confirm, dataIndex) => {
        clearFilters();
        setSearchParams((prev) => {
            const updatedParams = { ...prev };
            delete updatedParams[dataIndex];
            return updatedParams;
        });
        confirm();
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div className={css['dropdownMenu']}>
            <Input
              placeholder="Пошук"
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
              className={css['antInput']}
            />
            <Space>
                <Button
                    type="primary"
                    onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    icon={<SearchOutlined />}
                    size="small"
                    className={css['antBtn']}
                >
                    Пошук
                </Button>
                <Button
                    onClick={() => handleReset(clearFilters, confirm, dataIndex)}
                    size="small"
                    className={css['antBtn']}
                >
                    Скинути
                </Button>
            </Space>
          </div>
        ),
        filterIcon: (filtered) => (
          <SearchOutlined className={ filtered ? css['filteredIcon'] : css['icon']} />
        ),
        render: (text) => {
            const searchValue = searchParams[dataIndex] || '';
            return searchValue ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchValue]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
              text
            );
        }
    });

    const renderStatusTags = (status) => {
        const tags = [];

        if (status.is_active) {
            tags.push(<Tag color="green" key="active">Активний</Tag>);
        }
        if (status.is_inactive) {
            tags.push(<Tag color="cyan" key="active">Неактивний</Tag>);
        }
        if (status.is_staff) {
            tags.push(<Tag color="blue" key="staff">Адміністратор</Tag>);
        }
        if (status.is_superuser) {
            tags.push(<Tag color="purple" key="superuser">Суперадмін</Tag>);
        }
        if (status.is_deleted) {
            tags.push(<Tag color="volcano" key="deleted">Видалений</Tag>);
        }

        return <>{tags}</>;
    };

    const columns = [
        {
            title: 'Прізвище',
            dataIndex: 'surname',
            key: 'surname',
            sorter: true,
            sortOrder: sortInfo.field === 'surname' ? sortInfo.order : null,
            sortIcon: ({ sortOrder }) => getSortIcon(sortOrder),
            render: (_, record) => `${record.surname}`,
            ...getColumnSearchProps('surname'),
        },
        {
            title: 'Ім\'я',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            sortOrder: sortInfo.field === 'name' ? sortInfo.order : null,
            sortIcon: ({ sortOrder }) => getSortIcon(sortOrder),
            render: (_, record) => `${record.name}`,
            ...getColumnSearchProps('name'),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: true,
            sortOrder: sortInfo.field === 'email' ? sortInfo.order : null,
            sortIcon: ({ sortOrder }) => getSortIcon(sortOrder),
            render: (email) => (
                <p>
                    {email.length > LENGTH_EMAIL ? (
                        <Tooltip title={email} placement="top">
                            <span>{`${email.slice(0, LENGTH_EMAIL)}...`}</span>
                        </Tooltip>
                    ) : (
                        <span>{email}</span>
                    )}
                </p>
            ),
            ...getColumnSearchProps('email'),
        },
        {
            title: 'Компанія',
            dataIndex: 'company_name',
            key: 'company_name',
            sorter: true,
            sortOrder: sortInfo.field === 'company_name' ? sortInfo.order : null,
            sortIcon: ({ sortOrder }) => getSortIcon(sortOrder),
            render: (company_name) => (
                <p>
                    {company_name && company_name.length > LENGTH_EMAIL ? (
                        <Tooltip title={company_name} placement="top">
                            <span>{`${company_name.slice(0, LENGTH_EMAIL)}...`}</span>
                        </Tooltip>
                    ) : (
                        <span>{company_name}</span>
                    )}
                </p>
            ),
            ...getColumnSearchProps('company_name'),
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            render: (status) => renderStatusTags(status),
            filters: [
                { text: 'Aктивні', value: 'is_active' },
                { text: 'Неактивні', value: 'is_inactive' },
                { text: 'Aдміністратори', value: 'is_staff' },
                { text: 'Суперюзер', value: 'is_superuser' },
                { text: 'Видалені', value: 'is_deleted' },
            ],
            onFilter: (value) => value
        },
        {
            title: 'Дата реєстрації',
            dataIndex: 'registration_date',
            key: 'registration_date',
            sorter: true,
            sortOrder: sortInfo.field === 'registration_date' ? sortInfo.order : null,
            sortIcon: ({ sortOrder }) => getSortIcon(sortOrder)
        },
        {
            title: 'Дії',
            dataIndex: 'actions',
            key: 'actions',
            render: (_, user) => (
                <UserActions
                    user={user}
                    onActionComplete={() => {
                        mutate(url);
                    }}
                />
            ),
        },
    ];

    return (
        <div className={css['table-container']}>
            <Pagination
                showSizeChanger
                current={currentPage}
                pageSize={pageSize}
                total={totalItems}
                onChange={handlePageChange}
                onShowSizeChange={handlePageChange}
                showTitle={false}
                className={css['pagination']}
            />
            <Table
                columns={columns}
                dataSource={users}
                onChange={handleTableChange}
                pagination={false}
                loading={loading}
                tableLayout="fixed"
                locale={{
                    triggerDesc: 'Сортувати в порядку спадання',
                    triggerAsc: 'Сортувати в порядку зростання',
                    cancelSort: 'Відмінити сортування',
                }}
            />
            <Pagination
                showSizeChanger
                current={currentPage}
                pageSize={pageSize}
                total={totalItems}
                onChange={handlePageChange}
                onShowSizeChange={handlePageChange}
                showTitle={false}
                className={css['pagination']}
            />
        </div>
    );
}

export default UserTable;
