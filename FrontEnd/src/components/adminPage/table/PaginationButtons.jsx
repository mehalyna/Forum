import PropTypes from 'prop-types';
import css from './PaginationButtons.module.css';

function PaginationButtons({ currentPage, totalPages, onPageChange, pageSize, onPageSizeChange }) {
    const goToPreviousPage = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePageSizeChange = (e) => {
        const newSize = parseInt(e.target.value, 10);
        onPageSizeChange(newSize);
    };

    return (
        <div className={css['buttons-section']}>
            <div className={css['buttons-section-content']}>
                <button className={css['pagination-button']} onClick={goToPreviousPage}>&#60;</button>
                <label className={css['pagination-counter']}>{currentPage}/{totalPages}</label>
                <button className={css['pagination-button']} onClick={goToNextPage}>&#62;</button>
                <select value={pageSize} onChange={handlePageSizeChange}>
                    <option value={3}>3</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                </select>
            </div>
        </div>
    );
}


PaginationButtons.propTypes = {
    onPageSizeChange: PropTypes.func.isRequired,
    pageSize: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired
};

export default PaginationButtons;
