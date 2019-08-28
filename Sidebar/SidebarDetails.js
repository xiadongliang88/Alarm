import React, { Fragment } from 'react'
import { Modal } from 'choerodon-ui'

const { Sidebar } = Modal

const contentsDOM = props => {
    let channelAry = []

    for (const key in props.record.channel_templates) {
        let label

        if (key === 'sms') return label = '短信'

        if (key === 'wechat') return label = '企业微信'

        if (key === 'email') return label = '邮件'

        channelAry.push({
            key: key,
            label: label,
            value: props.record.channel_templates[key]
        })
    }

    return (
        <Fragment>
            {
                channelAry.map(item => 
                    <div className="AlarmStrategy-span-contents-item" key={item.key}>
                        <div className="AlarmStrategy-p">
                            <span className="AlarmStrategy-span-label gray">
                                告警渠道
                            </span>
                            <span className="gray">
                                {item.label}
                            </span>
                        </div>
                        <div className="AlarmStrategy-m marginT10">
                            <span className="AlarmStrategy-span-label-sub gray">
                                告警消息
                            </span>
                            <div className="AlarmStrategy-mes" style={{whiteSpace:"pre-line", color:"#696969"}}>
                                {item.value}
                            </div>
                        </div>
                    </div>
                )
            }
        </Fragment>
    )
}

const SidebarDetails = props => {
    return (
        <Sidebar
            title="详情"
            visible={props.visible}
            onOk={props.handleOkDetails}
            onCancel={props.handleCancelDetails}
            cancelText="取消"
            okText="确定"
        >
            <div className="AlarmStrategy-p marginT20">
                <span className="AlarmStrategy-span-label">
                    策略名称:
                </span>
                <span className="AlarmStrategy-span-value gray">
                    {props.record.name}
                </span>
            </div>
            <div className="AlarmStrategy-p marginT20">
                <span className="AlarmStrategy-span-label">
                    统计周期:
                </span>
                <span className="AlarmStrategy-span-value gray">
                    {props.record.interval}
                </span>
            </div>
            <div className="AlarmStrategy-p marginT20">
                <span className="AlarmStrategy-span-label">
                    统计阈值:
                </span>
                <span className="AlarmStrategy-span-value gray">
                    {props.record.threshold}
                </span>
            </div>
            <div className="AlarmStrategy-p marginT20">
                <span className="AlarmStrategy-span-label">
                    告警规则:
                </span>
                <span className="AlarmStrategy-span-value gray">
                    1
                </span>
            </div>
            <div className="AlarmStrategy-p marginT20">
                <span className="AlarmStrategy-span-label">
                    告警对象:
                </span>
                <span className="AlarmStrategy-span-value gray">
                    {props.record.recipients.map(item => 
                        <span key={item.id}>{item.username}</span>
                    )}
                </span>
            </div>

            <div className="AlarmStrategy-p marginT20">
                <span className="AlarmStrategy-span-contents">
                    告警内容:
                </span>
                <br />
                <div className="marginT20">
                    {contentsDOM(props)}
                </div>
            </div>
        </Sidebar>
    )
}

export default SidebarDetails