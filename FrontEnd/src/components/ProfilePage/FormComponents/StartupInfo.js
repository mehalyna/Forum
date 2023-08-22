import css from './FormComponents.module.css';
import { useState, useEffect } from 'react';

import FullField from './FormFields/FullField';
import HalfFormField from './FormFields/HalfFormField';
import MultipleSelectChip from './FormFields/MultipleSelectChip';
import TextField from './FormFields/TextField';

import Mybutton from '../UI/Mybutton/Mybutton';

const LABELS = {
    'startupName': 'Назва стартапу',
    'investmentAmount': 'Розмір інвестицій (в гривнях)',
    'cooperationGoals': 'Ціль співпраці',
    'endResult': 'Кінцевий результат',
    'competitiveAdvantageIdea': 'Конкурентна перевага ідеї',
    'risks': 'Ризики',
    'searchPartners': 'Пошук партнерів',
    'startupIdea': 'Опис ідеї стартапу'
};

const COOPERATION_GOALS = [
    { name: "Гроші" },
    { name: "Партнерство" },
];

const StartupInfo = (props) => {
    const [user, setUser] = useState(props.user);
    const [selectedCooperationGoals, setSelectedCooperationGoals] = useState(props.user.cooperationGoals);    
    const maxLength = 1000;

    const onUpdateField = e => {
        setUser((prevState) => {
            return { ...prevState, [e.target.name]: e.target.value };
        });
    };

    const onUpdateTextAreaField = e => {
        if (e.target.value.length <= maxLength)
            setUser((prevState) => {
                return { ...prevState, [e.target.name]: e.target.value };
            });
    };

    const onUpdateSelectField = e => {
        const selectName = e.target.name;
        if (selectName === 'cooperationGoals') {
            setSelectedCooperationGoals(Array.from(e.target.value, option => option));
        }
    };

    useEffect(() => {
        setUser((prevState) => {
            return { ...prevState, 'cooperationGoals': selectedCooperationGoals };
        });
    }, [selectedCooperationGoals]);

    const handleSubmit = (event) => {
        event.preventDefault();
        props.onUpdate(user);
        // TODO something
    };

    return (
        <div className={css['form__container']}>
            <form onSubmit={handleSubmit} autoComplete='off' noValidate>
                <div className={css['fields']}>
                    <FullField
                        name='startupName'
                        label={LABELS.startupName}
                        updateHandler={onUpdateField}
                        requredField={false}
                        value={user.startupName}
                    />
                    <div className={css['fields-groups']}>
                    <HalfFormField
                        inputType='number'
                        name='investmentAmount'
                        label={LABELS.investmentAmount}
                        updateHandler={onUpdateField}
                        requredField={false}
                        value={user.investmentAmount}
                    />
                    <MultipleSelectChip
                        name='cooperationGoals'
                        options={COOPERATION_GOALS}
                        label={LABELS.cooperationGoals}
                        updateHandler={onUpdateSelectField}
                        requredField={false}
                        value={selectedCooperationGoals}
                        defaultValue="Оберіть"
                    />
                    </div>
                    <TextField
                        name='endResult'
                        label={LABELS.endResult}
                        updateHandler={onUpdateTextAreaField}
                        requredField={false}
                        value={user.endResult}
                        maxLength={maxLength}
                    />
                    <TextField
                        name='competitiveAdvantageIdea'
                        label={LABELS.competitiveAdvantageIdea}
                        updateHandler={onUpdateTextAreaField}
                        requredField={false}
                        value={user.competitiveAdvantageIdea}
                        maxLength={maxLength}
                    />
                    <TextField
                        name='risks'
                        label={LABELS.risks}
                        updateHandler={onUpdateTextAreaField}
                        requredField={false}
                        value={user.risks}
                        maxLength={maxLength}
                    />
                    <TextField
                        name='searchPartners'
                        label={LABELS.searchPartners}
                        updateHandler={onUpdateTextAreaField}
                        requredField={false}
                        value={user.searchPartners}
                        maxLength={maxLength}
                    />
                    <TextField
                        name='startupIdea'
                        label={LABELS.startupIdea}
                        updateHandler={onUpdateTextAreaField}
                        requredField={false}
                        value={user.startupIdea}
                        maxLength={maxLength}
                    />
                </div>
                <Mybutton />
            </form>
        </div>
    );
};

export default StartupInfo;