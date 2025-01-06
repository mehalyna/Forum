import {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import axios from 'axios';
import useSWR, {mutate} from 'swr';
import {Button, Input, Pagination, Space, Table, Tag, DatePicker} from 'antd';
import {CaretDownOutlined, CaretUpOutlined, SearchOutlined} from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import UserActionsProfiles from './UserActionsProfiles';
import css from './ProfilesTable.module.scss';


const DEFAULT_PAGE_SIZE = 10;

function ProfilesTable() {
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
    function getOrdering(sortInfo) {
        if (sortInfo.field) {
            return `&ordering=${sortInfo.order === 'ascend' ? sortInfo.field : '-' + sortInfo.field}`;
        }
        return '';
    }
    const ordering = getOrdering(sortInfo);
    const filtering = statusFilters ? statusFilters.map((filter) => `&${filter}=true`).join('') : '';
    const query = new URLSearchParams(searchParams).toString();
    const url = `${process.env.REACT_APP_BASE_API_URL}/api/admin/profiles?page=${currentPage}&page_size=${pageSize}${ordering}${filtering}&${query}`;
    async function fetcher(url) {
        const response = await axios.get(url);
        return response.data;
    }
    const { RangePicker } = DatePicker;
    const { data, isValidating: loading } = useSWR(url, fetcher);
    const profiles = data ? data.results : [];
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
        filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}) => (
            <div className={css['dropdownMenu']}>
                <Input
                    placeholder="Пошук"
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value]: [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    className={css['antInput']}
                ></Input>
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
                className={css['ant-btn']}
              >
                Скинути
              </Button>
            </Space>
          </div>
            ),
        filterIcon: (filtered) => <SearchOutlined className={ filtered ? css['filteredIcon'] : css['icon']}/>,
        onFilter: (value, record) =>
            record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
        render: (text) => {
            const searchValue = searchParams[dataIndex] || '';
            return searchValue? (
                <Highlighter
                    highlightStyle={{backgroundColor: '#ffc069', padding: 0}}
                    searchWords={[searchValue]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            );
        }
    });
    const getDateRangeColumnProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className={css['dropdownMenu']}>
            <RangePicker
                onChange={(dates, dateStrings) => setSelectedKeys([dateStrings])}
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
                    className={css['ant-btn']}
                >
                    Скинути
                </Button>
            </Space>
        </div>
    ),
    filterIcon: (filtered) => <SearchOutlined className={filtered ? css['filteredIcon'] : css['icon']} />,
    onFilter: (value, record) => {
        const [start, end] = value;
        const recordDate = new Date(record[dataIndex]);
        return (!start || recordDate >= new Date(start)) && (!end || recordDate <= new Date(end));
    },
});
    const renderCompanyTypeTags = (type) => {
        const tags = [];

        if (type === 'Компанія') {
            tags.push(<Tag color="processing" key="active">Компанія</Tag>);
        }
        if (type === 'Стартап') {
            tags.push(<Tag color="lime" key="deleted">Стартап</Tag>);
        }
        if (type === 'Компанія і стартап') {
            tags.push(<Tag color="green" key="deleted">Компанія і стартап</Tag>);
        }

        return <>{tags}</>;
    };

    const renderStatusTags = (status) => {
        const tags = [];

        if (status === 'undefined') {
            tags.push(<Tag color="#a0e7e5" key="active">Не визначена</Tag>);
        }
        if (status === 'pending') {
            tags.push(<Tag color="#fbe7c6" key="deleted">На модерації</Tag>);
        }
        if (status === 'blocked') {
            tags.push(<Tag color="#ffaebc" key="deleted">Заблокована</Tag>);
        }
        if (status === 'active') {
            tags.push(<Tag color="#b4f8c8" key="deleted">Активна</Tag>);
        }
        if (status === 'approved') {
            tags.push(<Tag color="#7cf3a0" key="deleted">Підтверджена</Tag>);
        }
        if (status === 'auto_approved') {
            tags.push(<Tag color="#7cf3a0" key="deleted">Підтверджена</Tag>);
        }

        return <>{tags}</>;
    };

    const renderActivityTags = (activities) => {
    const tags = [];
    activities.forEach((activity) => {
        if (activity.name === 'Виробник') {
            tags.push(<Tag color="cyan" key={activity.name}>Виробник</Tag>);
        }
        if (activity.name === 'Імпортер') {
            tags.push(<Tag color="cyan" key={activity.name}>Імпортер</Tag>);
        }
        if (activity.name === 'Роздрібна мережа') {
            tags.push(<Tag color="cyan" key={activity.name}>Роздрібна мережа</Tag>);
        }
        if (activity.name === 'Інші послуги') {
            tags.push(<Tag color="cyan" key={activity.name}>Інші послуги</Tag>);
        }
    });
    return <>{tags}</>;
    };
    const renderBusinessEntityTags = (business_entity) => {
        const tags = [];
        if (business_entity === 'Юридична особа') {
            tags.push(<Tag color="green" key="active">Юридична особа</Tag>);
        }
        if (business_entity === 'ФОП') {
            tags.push(<Tag color="blue" key="deleted">ФОП</Tag>);
        }

        return <>{tags}</>;
    };

    const columns = [
        {
            title: (<div className={css['TableSubject']}>
                Назва компанії
            </div>),
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            sortOrder: sortInfo.field === 'name' ? sortInfo.order : null,
            sortIcon: ({ sortOrder }) => getSortIcon(sortOrder),
            ...getColumnSearchProps('name'),
            width: 140,
            render: (text, profile) => (
                <UserActionsProfiles
                    profile={profile}
                    text = {text}
                    onActionComplete={() => {
                        mutate(url);
                    }}
                />
            ),
        },
        {
            title: (<div className={css['TableSubject']}>
                Тип компанії
            </div>),
            dataIndex: 'company_type',
            key: 'company_type',
            render: (company_type) => renderCompanyTypeTags(company_type),
            filters: [
                { text: 'Компанія', value: 'Компанія' },
                { text: 'Стартап', value: 'Стартап' },
                { text: 'Компанія і стартап', value: 'Компанія і стартап' },
            ],
            onFilter: (value, record) => record.company_type === value,
            width: 140
        },
        {
            title: (<div className={css['TableSubject']}>
                Вид діяльності
            </div>),
            dataIndex: 'activities',
            key: 'activities',
            render: (activity) => renderActivityTags(activity),
            filters: [
                { text: 'Імпортер', value: 'Імпортер' },
                { text: 'Виробник', value: 'Виробник' },
                { text: 'Роздрібна мережа', value: 'Роздрібна мережа' },
                { text: 'Інші послуги', value: 'Інші послуги' },
            ],
            onFilter: (value, record) =>
                record.activities && record.activities.some((activity) => activity.name === value),
            width: 160
            },
        {
            title: (<div className={css['TableSubject']}>
                Суб&apos;єкт <br/> господарювання
            </div>),
            dataIndex: 'business_entity',
            key: 'business_entity',
            render: (entity) => renderBusinessEntityTags(entity),
            filters: [
                { text: 'ФОП', value: 'ФОП' },
                { text: 'Юридична особа', value: 'Юридична особа' },
            ],
            onFilter: (value, record) => record.business_entity === value,
            width: 180
        },
        {
            title: (<div className={css['TableSubject']}>
                Дата реєстрації
            </div>),
            dataIndex: 'created_at',
            key: 'created_at',
            sorter: true,
            sortOrder: sortInfo.field === 'created_at' ? sortInfo.order : null,
            sortIcon: ({sortOrder}) => getSortIcon(sortOrder),
            ...getDateRangeColumnProps('created_at'),
            width: 170
        },
        {
            title: (<div className={css['TableSubject']}>
                Дата оновлення
            </div>),
            dataIndex: 'updated_at',
            key: 'updated_at',
            sorter: true,
            sortOrder: sortInfo.field === 'updated_at' ? sortInfo.order : null,
            sortIcon: ({sortOrder}) => getSortIcon(sortOrder),
            ...getDateRangeColumnProps('updated_at'),
            width: 150
        },
        {
            title: (<div className={css['TableSubject']}>
                Статус
            </div>),
            dataIndex: 'status',
            key: 'status',
            render: (status) => renderStatusTags(status),
            filters: [
                { text: 'Не визначена', value: 'undefined' },
                { text: 'На модерації', value: 'pending' },
                { text: 'Заблокована', value: 'blocked' },
                { text: 'Активна', value: 'active' },
                { text: 'Підтверджена', value: ['approved', 'auto_approved']},
            ],
            onFilter: (value, record) => {
                if (Array.isArray(value)) {
                    return value.includes(record.status);
                }
                    return record.status === value;
            },
            width: 120
        },
        {
            title: (<div className={css['TableSubject']}>
                Представник
            </div>),
            dataIndex: 'representative',
            key: 'representative',
            sorter: true,
            sortOrder: sortInfo.field === 'representative' ? sortInfo.order : null,
            ...getColumnSearchProps('representative'),
            width: 170,
            },
        {
            title: (<div className={css['TableSubject']}>
                Контакти
            </div>),
            dataIndex: 'phone',
            key: 'phone',
            sorter: true,
            sortOrder: sortInfo.field === 'phone' ? sortInfo.order : null,
            ...getColumnSearchProps('phone'),
            width: 130,
            },
        {
            title: (<div className={css['TableSubject']}>
                Адреса
            </div>),
            dataIndex: 'address',
            key: 'address',
            sorter: true,
            sortOrder: sortInfo.field === 'address' ? sortInfo.order : null,
            ...getColumnSearchProps('address'),
            width: 130
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
                dataSource={profiles}
                onChange={handleTableChange}
                pagination={false}
                loading={loading}
                scroll={{ x: 800 }}
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

export default ProfilesTable;
