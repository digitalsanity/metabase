/* eslint "react/prop-types": "warn" */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { reduxForm } from "redux-form";

import S from "metabase/reference/Reference.css";

import List from "metabase/components/List.jsx";
import LoadingAndErrorWrapper from "metabase/components/LoadingAndErrorWrapper.jsx";

import EditHeader from "metabase/reference/components/EditHeader.jsx";
import EditableReferenceHeader from "metabase/reference/components/EditableReferenceHeader.jsx";
import Detail from "metabase/reference/components/Detail.jsx";
import FieldTypeDetail from "metabase/reference/components/FieldTypeDetail.jsx";
import UsefulQuestions from "metabase/reference/components/UsefulQuestions.jsx";

import {
    tryUpdateData,
    getQuestionUrl
} from '../utils';

import {
    getSection,
    getData,
    getTable,
    getFields,
    getGuide,
    getError,
    getLoading,
    getUser,
    getIsEditing,
    getHasDisplayName,
    getHasRevisionHistory,
    getHasSingleSchema,
    getForeignKeys,
    getIsFormulaExpanded
} from "../selectors";

import * as metadataActions from 'metabase/redux/metadata';
import * as actions from 'metabase/reference/reference';


// const section = {
//         id: `/reference/segments/${segment.id}/fields/${field.id}`,
//         name: 'Details',
//         update: 'updateField',
//         type: 'field',
//         breadcrumb: `${field.display_name}`,
//         fetch: {
//             fetchSegmentFields: [segment.id]
//         },
//         get: "getFieldBySegment",
//         icon: "document",
//         headerIcon: "field",
//         parent: getSegmentSections(segment)[`/reference/segments/${segment.id}/fields`]
//     }

const interestingQuestions = (table, field) => {
    return [
        {
            text: `Number of ${table && table.display_name} grouped by ${field.display_name}`,
            icon: { name: "number", scale: 1, viewBox: "8 8 16 16" },
            link: getQuestionUrl({
                dbId: table && table.db_id,
                tableId: table.id,
                fieldId: field.id,
                getCount: true
            })
        },
        {
            text: `All distinct values of ${field.display_name}`,
            icon: "table2",
            link: getQuestionUrl({
                dbId: table && table.db_id,
                tableId: table.id,
                fieldId: field.id
            })
        }
    ]
}

const mapStateToProps = (state, props) => {
    const entity = getData(state, props) || {};
    const guide = getGuide(state, props);
    const fields = getFields(state, props);

    const initialValues = {
        important_fields: guide && guide.metric_important_fields &&
            guide.metric_important_fields[entity.id] &&
            guide.metric_important_fields[entity.id]
                .map(fieldId => fields[fieldId]) ||
                []
    };

    return {
        section: getSection(state, props),
        entity,
        table: getTable(state, props),
        guide,
        loading: getLoading(state, props),
        // naming this 'error' will conflict with redux form
        loadingError: getError(state, props),
        user: getUser(state, props),
        foreignKeys: getForeignKeys(state, props),
        isEditing: getIsEditing(state, props),
        hasSingleSchema: getHasSingleSchema(state, props),
        hasDisplayName: getHasDisplayName(state, props),
        isFormulaExpanded: getIsFormulaExpanded(state, props),
        hasRevisionHistory: getHasRevisionHistory(state, props),
        initialValues,
    }
};

const mapDispatchToProps = {
    ...metadataActions,
    ...actions
};

const validate = (values, props) => props.hasRevisionHistory ?
    !values.revision_message ?
        { revision_message: "Please enter a revision message" } : {} :
    {};

@connect(mapStateToProps, mapDispatchToProps)
@reduxForm({
    form: 'details',
    fields: ['name', 'display_name', 'description', 'revision_message', 'points_of_interest', 'caveats',  'special_type', 'fk_target_field_id'],
    validate
})
export default class SegmentFieldDetail extends Component {
    static propTypes = {
        style: PropTypes.object.isRequired,
        entity: PropTypes.object.isRequired,
        table: PropTypes.object,
        user: PropTypes.object.isRequired,
        foreignKeys: PropTypes.object,
        isEditing: PropTypes.bool,
        startEditing: PropTypes.func.isRequired,
        endEditing: PropTypes.func.isRequired,
        startLoading: PropTypes.func.isRequired,
        endLoading: PropTypes.func.isRequired,
        setError: PropTypes.func.isRequired,
        updateField: PropTypes.func.isRequired,
        handleSubmit: PropTypes.func.isRequired,
        resetForm: PropTypes.func.isRequired,
        fields: PropTypes.object.isRequired,
        section: PropTypes.object.isRequired,
        hasSingleSchema: PropTypes.bool,
        hasDisplayName: PropTypes.bool,
        hasRevisionHistory: PropTypes.bool,
        loading: PropTypes.bool,
        loadingError: PropTypes.object,
        submitting: PropTypes.bool,
    };

    render() {
        const {
            fields: { name, display_name, description, revision_message, points_of_interest, caveats, special_type, fk_target_field_id },
            style,
            section,
            entity,
            table,
            loadingError,
            loading,
            user,
            foreignKeys,
            isEditing,
            startEditing,
            endEditing,
            hasSingleSchema,
            hasDisplayName,
            hasRevisionHistory,
            handleSubmit,
            resetForm,
            submitting,
        } = this.props;

        const onSubmit = handleSubmit(async (fields) =>
            await tryUpdateData(fields, this.props)
        );

        return (
            <form style={style} className="full"
                onSubmit={onSubmit}
            >
                { isEditing &&
                    <EditHeader
                        hasRevisionHistory={hasRevisionHistory}
                        onSubmit={onSubmit}
                        endEditing={endEditing}
                        reinitializeForm={resetForm}
                        submitting={submitting}
                        revisionMessageFormField={revision_message}
                    />
                }
                <EditableReferenceHeader
                    entity={entity}
                    table={table}
                    section={section}
                    user={user}
                    isEditing={isEditing}
                    hasSingleSchema={hasSingleSchema}
                    hasDisplayName={hasDisplayName}
                    startEditing={startEditing}
                    displayNameFormField={display_name}
                    nameFormField={name}
                />
                <LoadingAndErrorWrapper loading={!loadingError && loading} error={loadingError}>
                { () =>
                    <div className="wrapper wrapper--trim">
                        <List>
                            <li className="relative">
                                <Detail
                                    id="description"
                                    name="Description"
                                    description={entity.description}
                                    placeholder="No description yet"
                                    isEditing={isEditing}
                                    field={description}
                                />
                            </li>
                            { !isEditing &&
                                <li className="relative">
                                    <Detail
                                        id="name"
                                        name="Actual name in database"
                                        description={entity.name}
                                        subtitleClass={S.tableActualName}
                                    />
                                </li>
                            }
                            <li className="relative">
                                <Detail
                                    id="points_of_interest"
                                    name={`Why this ${section.type} is interesting`}
                                    description={entity.points_of_interest}
                                    placeholder="Nothing interesting yet"
                                    isEditing={isEditing}
                                    field={points_of_interest}
                                    />
                            </li>
                            <li className="relative">
                                <Detail
                                    id="caveats"
                                    name={`Things to be aware of about this ${section.type}`}
                                    description={entity.caveats}
                                    placeholder="Nothing to be aware of yet"
                                    isEditing={isEditing}
                                    field={caveats}
                                />
                            </li>


                            { !isEditing && 
                                <li className="relative">
                                    <Detail
                                        id="base_type"
                                        name={`Data type`}
                                        description={entity.base_type}
                                    />
                                </li>
                            }
                                <li className="relative">
                                    <FieldTypeDetail
                                        field={entity}
                                        foreignKeys={foreignKeys}
                                        fieldTypeFormField={special_type}
                                        foreignKeyFormField={fk_target_field_id}
                                        isEditing={isEditing}
                                    />
                                </li>
                            { !isEditing &&
                                <li className="relative">
                                    <UsefulQuestions questions={interestingQuestions(this.props.table, this.props.entity)} />
                                </li>
                            }


                        </List>
                    </div>
                }
                </LoadingAndErrorWrapper>
            </form>
        )
    }
}
