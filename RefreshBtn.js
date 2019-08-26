import React, { Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import { Button } from 'choerodon-ui'
import '../../main.scss'

const RefreshBtn = props => {
    return (
        <Fragment>
            <Button key="refresh" icon="refresh" onClick={props.reload}>
                <FormattedMessage id="refresh" />
            </Button>
        </Fragment>
    )
}

export default RefreshBtn