import React, { Component, Fragment } from 'react'
import { Modal, Input, Select, Icon, List, message } from 'choerodon-ui'
import { axios} from "choerodon-front-boot"
import { Button } from 'choerodon-ui/lib/radio'

const { Sidebar } = Modal

let children = []

class SidebarModify extends Component {
    constructor(props){
        super(props)
    }

    state = {
        name: this.props.record.name,
        interval: this.props.record.interval,
        threshold: this.props.record.threshold,
        recipients: this.props.record.recipients,
        users: [],
        relationship: '',
        relationshipOpt: [
            {
                key: 'and',
                value: 'AND'
            }, 
            {
                key: 'or',
                value:'OR'
            }
        ],
        primaryKey: '',
        primaryKeyOpt: [
            'appname', 
            'message', 
            'env', 
            '@version', 
            '@timestamp', 
            'host', 
            'project',
            'type',
            'status',
            'ip',
            'date'
        ],
        subRelationOpt: ['and', 'or'],
        ruleOpt: [
            {
                label: 'contains',
                value: '包含'
            },
            {
                label: 'not_contains',
                value: '不包含'
            },
            {
                label: 'greater_than',
                value: '大于'
            },
            {
                label: 'greater_than_equal',
                value: '大于等于'
            },
            {
                label: 'less_than',
                value: '小于'
            },
            {
                label: 'less_than_equal',
                value: '小于等于'
            }
        ],
        channelAry: this.handleChannelAry(),
        channelOpt: [
            {
                label: 'wechat',
                value: '企业微信',
                message: '策略:{{rule_name}}\n项目:{{project_name}}\n服务:{{app_name}}\n异常次数:{{error_count}}\n发生时间:{{date_time}}\n{{kibana_url}}'
            },
            {
                label: 'sms',
                value: '短信',
                message:'策略:{{rule_name}}\n项目:{{project_name}}\n服务:{{app_name}}\n异常次数:{{error_count}}\n发生时间:{{date_time}}\n'
            },
            {
                label: 'email',
                value: '邮箱',
                message: '策略:{{rule_name}}\n项目:{{project_name}}\n服务:{{app_name}}\n异常次数:{{error_count}}\n发生时间:{{date_time}}\n链接地址:{{kibana_url}}'
            }
        ],
        filterRule: this.props.record.filter_rule,
        newRuleList: [],
        multSelect: [],
        values: [],
        nameRepeat: false
    }

    componentDidMount() {
        const recipients = [ ...this.state.recipients ]

        let recipientsUsers = []
        for (const item of recipients) {
            recipientsUsers.push(item.username)
        }

        this.setState({
            values: recipientsUsers
        })
    }

    handleChannelAry() {
        let channelAry = []

        const channelTemplates = { ...this.props.record.channel_templates }

        for (let key in channelTemplates) {
            channelAry.push({
                label: key,
                value: channelTemplates[key]
            })
        }

        return channelAry
    }

    handleInput = (e, variable) => {
        if (variable === 'name') {
            const projectId = this.props.projectId
            const appName = this.props.appInfo.name
            const value = e.target.value

            if (value !== this.props.record.name ) {

                axios.get(
                    `/alert/v1/projects/${projectId}/appalarmrule?pageNum=1&pageSize=10&app_name=${appName}&name=${e.target.value}`
                ).then(response => {

                    if (response.results instanceof Array && response.results.length > 0) {
                        this.setState({
                            nameRepeat: true
                        })
                    } else {
                        this.setState({
                            nameRepeat: false
                        })
                    }
                })
            }
        }

        this.setState({
            [variable]: e.target.value
        })
    }

    handleChannelSelect = (value, e, index) => {
        let newChannelAry = [ ...this.state.channelAry ]

        newChannelAry[index].label = value
        newChannelAry[index].value = e.props.message

        this.setState({
            channelAry: newChannelAry
        })
    }

    handleAddChange = (index, e) => {
        let newChannelAry = [ ...this.state.channelAry ]

        newChannelAry[index].value = e.target.value

        this.setState({
            channelAry: newChannelAry
        })
    }

    handleMultSelect = (value, ary) => {
        let newAry = []

        for (const item of ary) {
            const index = item.props.value.indexOf('#')

            newAry.push({
                id: item.props.value.substring(index + 1),
                username: item.props.value
            })
        }

        let newRecipients = [ ...newAry ]
        let newValues = [ ...value ]

        this.setState({
            recipients: newRecipients,
            values: newValues
        })
    }

    handleAddChannel = () => {
        let channelAry = [ ...this.state.channelAry ]

        channelAry.push({
            label: '',
            value: ''
        })

        this.setState({
            channelAry: channelAry
        })
    }

    handleDeleteChannel = index => {
        let channelAry = [ ...this.state.channelAry ]

        if (channelAry.length > 1) {
            channelAry.splice(index, 1)

            this.setState({
                channelAry: channelAry
            })
        } else {
            message.error('告警内容至少为一项')
        }
    }

    alarmContent = () => {
        return (
            <Fragment>
                {
                    this.state.channelAry.map((item, index) =>
                        <div key={index} className="AlarmStrategy-span-contents-item">
                            <div className="AlarmStrategy-p">
                                <span className="AlarmStrategy-span-label gray">
                                    <span style={{color: "red"}}>*</span>
                                    <span className="marginL5">告警渠道:</span>
                                </span>
                                <Select style={{width:480}} value={item.label} onSelect={(value, e) => this.handleChannelSelect(value, e, index)}>
                                    {
                                        this.state.channelOpt.map(optItem =>
                                            <Select.Option key={optItem.label} value={optItem.label} message={optItem.message}>
                                                {optItem.value}
                                            </Select.Option>
                                        )
                                    }
                                </Select>
                                <Icon className="marginL20" type="delete" style={{float: "right", cursor: "pointer"}} onClick={() => this.handleDeleteChannel(index)} />
                            </div>
                            <div className="AlarmStrategy-m marginT10">
                                <span className="AlarmStrategy-span-label-sub gray">
                                    <span style={{color: "red"}}>*</span>
                                    <span className="marginL5">告警消息:</span>
                                </span>
                                <textarea rows="3" cols="80" value={item.value} onChange={e => this.handleAddChange(index, e)} />
                            </div>
                        </div>
                    )
                }
                <Button style={{marginLeft: "400px", marginTop: "20px"}} onClick={this.handleAddChannel}>
                    + 添加告警渠道
                </Button>
            </Fragment>
        )
    }

    handleSubItemSelect = (value, subIndex, index, variable) => {
        let newList = [ ...this.state.filterRule ]

        newList[index].children[subIndex][variable] = value

        this.setState({
            filterRule: newList
        })
    }

    handleSubItemInput = (e, subIndex, index, variable) => {
        let newList = [ ...this.state.filterRule ]

        newList[index].children[subIndex][variable] = e.target.value

        this.setState({
            filterRule: newList
        })
    }

    handleRelationOutSide = (value, index) => {
        let newList = [ ...this.state.filterRule ]

        newList[index].relation = value

        this.setState({
            filterRule: newList
        })
    }

    handleAddSub = (index, subIndex) => {
        let newList = [ ...this.state.filterRule ]

        if (newList[index].children) {
            newList[index].children.push({
                field: '',
                condition: '',
                value: '',
                relation: ''
            })
        }

        this.setState({
            filterRule: newList
        })
    }

    handleDeleteSub = (index, subIndex) => {
        let newList = [ ...this.state.filterRule ]

        if (newList[index].children.length > 1) {
            newList[index].children.splice(subIndex, 1)

            this.setState({
                filterRule: newList
            })
        } else {
            message.error('每个规则组至少有一项')
        }
    }

    handleAddItem = () => {
        let newList = [ ...this.state.filterRule ]

        newList.push({
            relation: 'and',
            children: [
                {
                    field: '',
                    condition: '',
                    query: '',
                    relation: ''
                }
            ]
        })

        this.setState({
            filterRule: newList
        })
    }

    handleDeleteItem = index => {
        let newList = [ ...this.state.filterRule ]

        if (newList.length > 1) {
            newList.splice(index, 1)

            this.setState({
                filterRule: newList
            })
        } else {
            message.error('规则组最少为一行')
        }
    }

    handleOkModify = () => {
        let filterRuleCheck = true
        const channelAry = [ ...this.state.channelAry ]

        const { filterRule } = this.state

        const regS = /^\S+$/

        for (let i = 0; i < filterRule.length; i++) {

            for (let k = 0; k < filterRule[i].children.length ; k++) {
                if (filterRule[i].children[k].field === '') return filterRuleCheck = false

                if (filterRule[i].children[k].condition === '') return filterRuleCheck = false

                if (filterRule[i].children[k].query === '' || regS.test(filterRule[i].children[k].query) === false) return filterRuleCheck = false

                if (filterRule[i].children[k].relation === '' && k !== filterRule[i].children.length - 1) return filterRuleCheck = false
            }
        }

        let newLabels = []

        for (const item of channelAry) {
            newLabels.push(item.label)
        }

        const newLabelsSort = newLabels.slice().sort()

        let channelCheck = true

        for (let i = 0; i < newLabelsSort.length; i++) {

            if (i < newLabelsSort.length - 1) {

                if (newLabelsSort[i] === newLabelsSort[i + 1]) {
                    channelCheck = false
                    break
                }
            }
        }

        const regIsNum = /^\d+$/

        if (this.state.nameRepeat === true) {
            message.error('策略名称已存在')
            return
        }
        if (this.state.name === '') {
            message.error('策略名称不能为空')
            return
        }

        if (!regIsNum.test(this.state.interval)) {
            message.error('统计周期必须为数字')
            return
        }

        if (this.state.interval < 1 || this.state.interval > 1440) {
            message.error('统计周期为1-1400之间任意数')
            return
        }

        if (!regIsNum.test(this.state.threshold)) {
            message.error('告警阈值必须为数字')
            return
        }

        if (this.state.threshold < 1 || this.state.threshold > 32767) {
            message.error('告警阈值为1-32767之间任意数')
            return
        }

        if (filterRuleCheck === false) {
            message.error('条件关联关系不能为空')
            return
        }

        let channelNull = false
        let messageNull = false

        for (let i = 0; i < channelAry.length; i++) {
            if (channelAry[i].label === '') {
                channelNull = true
            }
            else if (channelAry[i].value === '') {
                messageNull = true
            }
        }

        if (this.state.recipients.length < 1) {
            message.error('告警对象不能为空')
            return
        }

        if (channelNull === true) {
            message.error('告警渠道不能为空')
            return
        }

        if (channelNull === true) {
            message.error('告警消息不能为空')
            return
        }

        if (channelCheck === false) {
            message.error('不能提交相同的告警渠道')
            return
        }

        let channelTemplates = {}

        for (let i = 0; i < channelAry.length; i++) {
            channelTemplates[channelAry[i].label] = channelAry[i].value
        }

        const data = {
            name: this.state.name,
            app_info: this.props.record.app_info,
            is_enabled: this.props.record.is_enabled,
            interval: this.state.interval,
            threshold: this.state.threshold,
            filter_rule: this.state.filterRule,
            recipients: this.state.recipients,
            channel_templates: channelTemplates
        }

        const { projectId } = this.props
        const { id } = this.props.record

        axios.put(`/alert/v1/projects/${projectId}/appalarmrule/${id}`, data).then(res => {
            if (res) {
                message.success('修改规则成功')
                this.props.handleOkModify()
            } else {
                message.success('修改规则失败')
            }
        }).catch(error => {
            message.error(error.response.request.responseText)
        })
    }

    render() {
        return (
            <Sidebar
                title="修改"
                visible={this.props.visible}
                onOk={() => this.handleOkModify()}
                onCancel={this.props.handleCancelModify}
                cancelText="取消"
                okText="确定"
            >
                <div className="AlarmStrategy-p marginT20">
                    <span className="AlarmStrategy-span-label">
                        <span style={{color: "red"}}>*</span>
                        <span className="marginL5">策略名称:</span>
                    </span>
                    <Input style={{width:480}} value={this.state.name} onChange={e => this.handleInput(e, 'name')} maxLength={32} />
                </div>
                <div className="AlarmStrategy-p marginT20">
                    <span className="AlarmStrategy-span-label">
                        <span style={{color: "red"}}>*</span>
                        <span className="marginL5">统计周期:</span>
                    </span>
                    <Input style={{width:480}} value={this.state.interval} placeholder='输入1-1440之间任意数' onChange={e => this.handleInput(e, 'interval')} type='number' />{` 分`}
                    <p className="gray marginL80">输入1-1440之间任意数, 默认值为1</p>
                </div>
                <div className="AlarmStrategy-p marginT20">
                    <span className="AlarmStrategy-span-label">
                        <span style={{color: "red"}}>*</span>
                        <span className="marginL5">告警阈值:</span>
                    </span>
                    <Input style={{width:480}} value={this.state.threshold} placeholder='输入1-32767之间任意数' onChange={e => this.handleInput(e, 'threshold')} />
                    <p className="gray marginL80">输入1-32767之间任意数, 默认值为1</p>
                </div>
                <div className="AlarmStrategy-p marginT20">
                    <span className="AlarmStrategy-span-label">
                        <span style={{color: "red"}}>*</span>
                        <span className="marginL5">告警规则:</span>
                    </span>
                    {
                        this.state.filterRule.map((item, index) =>
                            index === 0 ?
                                <List
                                    className="AlarmStrategy-div"
                                    key={index}
                                    header={
                                        <span className="AlarmStrategy-span">
                                            <div style={{display: "none"}}>
                                                <Select style={{width: 120}} disabled>
                                                </Select>
                                            </div>
                                            <Icon className="marginL20" type="delete" style={{float: "right", cursor: "pointer"}} onClick={() => this.handleDeleteItem(index)} />
                                        </span>
                                    }
                                    bordered
                                    dataSource={this.state.filterRule[index].children}
                                    renderItem={(subItem, subIndex) => (
                                        <List.Item key={subIndex}>
                                            <Select style={{width: 150}} placeholder="字段" value={subItem.field} onSelect={value => this.handleSubItemSelect(value, subIndex, index, 'field')}>
                                                {
                                                    this.state.primaryKeyOpt.map(optItem =>
                                                        <Select.Option key={optItem}>
                                                            {optItem}
                                                        </Select.Option>
                                                    )
                                                }
                                            </Select>
                                            <Select style={{width: 120}} placeholder="条件" value={subItem.condition} onSelect={value => this.handleSubItemSelect(value, subIndex, index, 'condition')} className="marginL20">
                                                {
                                                    this.state.ruleOpt.map(optItem =>
                                                        <Select.Option key={optItem.label}>
                                                            {optItem.value}
                                                        </Select.Option>
                                                    )
                                                }
                                            </Select>
                                            <span className="marginL20" style={{height: "21px"}}>
                                                <Input style={{width: 300}} placeholder="字段对应值" value={subItem.query} onChange={e => this.handleSubItemInput(e, subIndex, index, 'query')} />
                                            </span>
                                            <Select style={{width: 80}} placeholder="关系" value={subItem.relation} onSelect={value => this.handleSubItemSelect(value, subIndex, index, 'relation')} className="marginL20">
                                                {
                                                    this.state.subRelationOpt.map(optItem =>
                                                        <Select.Option key={optItem}>
                                                            {optItem}
                                                        </Select.Option>
                                                    )
                                                }
                                            </Select>
                                            <Button
                                                className="marginL20"
                                                funcType="raised"
                                                onClick={() => this.handleAddSub(index, subIndex)}
                                            >
                                                +
                                            </Button>
                                            <Button
                                                className="marginL20"
                                                funcType="raised"
                                                onClick={() => this.handleDeleteSub(index, subIndex)}
                                            >
                                                -
                                            </Button>
                                        </List.Item>
                                    )}
                                />
                                :
                                <List
                                    className="AlarmStrategy-div marginT20 marginL80"
                                    key={index}
                                    header={
                                        <span className="AlarmStrategy-span">
                                            <Select style={{width: 120}} value={item.relation} onSelect={value => this.handleRelationOutSide(value, index)}>
                                                {
                                                    this.state.relationshipOpt.map(item =>
                                                        <Select.Option key={item.key} value={item.key}>
                                                            {item.value}
                                                        </Select.Option>
                                                    )
                                                }
                                            </Select>
                                            <Icon className="marginL20" type="delete" style={{float: "right"}} onClick={() => this.handleDeleteItem(index)} />
                                        </span>
                                    }
                                    bordered
                                    dataSource={this.state.filterRule[index].children}
                                    renderItem={(subItem, subIndex) => (
                                        <List.Item key={subIndex}>
                                            <Select style={{width: 150}} placeholder="字段" value={subItem.field} onSelect={value => this.handleSubItemSelect(value, subIndex, index, 'field')}>
                                                {
                                                    this.state.primaryKeyOpt.map(optItem =>
                                                        <Select.Option key={optItem}>
                                                            {optItem}
                                                        </Select.Option>
                                                    )
                                                }
                                            </Select>
                                            <Select style={{width: 120}} placeholder="条件" value={subItem.condition} onSelect={value => this.handleSubItemSelect(value, subIndex, index, 'condition')} className="marginL20">
                                                {
                                                    this.state.ruleOpt.map(optItem =>
                                                        <Select.Option key={optItem.label}>
                                                            {optItem.value}
                                                        </Select.Option>
                                                    )
                                                }
                                            </Select>
                                            <span className="marginL20">
                                                <Input style={{width: 300}} placeholder="字段对应值" value={subItem.query} onChange={e => this.handleSubItemInput(e, subIndex, index, 'query')} />
                                            </span>
                                            <Select style={{width: 80}} placeholder="关系" value={subItem.relation} onSelect={value => this.handleSubItemSelect(value, subIndex, index, 'relation')} className="marginL20">
                                                {this.state.subRelationOpt.map(optItem =>
                                                    <Select.Option key={optItem}>
                                                        {optItem}
                                                    </Select.Option>
                                                )}
                                            </Select>
                                            <Button
                                                className="marginL20"
                                                funcType="raised"
                                                onClick={() => this.handleAddSub(index, subIndex)}
                                            >
                                                +
                                            </Button>
                                            <Button
                                                className="marginL20"
                                                funcType="raised"
                                                onClick={() => this.handleDeleteSub(index, subIndex)}
                                            >
                                                -
                                            </Button>
                                        </List.Item>
                                    )}
                                />
                        )
                    }
                </div>
                <br />
                <Button style={{marginLeft: "480px", marginTop: "20px"}} onClick={this.handleAddItem}>
                    + 添加条件组
                </Button>
                <div className="AlarmStrategy-p marginT40">
                    <span className="AlarmStrategy-span-label">
                        <span style={{color: "red"}}>*</span>
                        <span className="marginL5">告警对象:</span>
                    </span>
                    <Select
                        mode="multiple"
                        style={{width:480}}
                        optionFilterProp="children"
                        value={this.state.values}
                        onChange={this.handleMultSelect}
                        filter
                    >
                        {this.props.getUsers.length ? this.props.getUsers.map(item => <Select.Option key={item.id} value={item.username}>{item.username}</Select.Option>) : null}
                    </Select>
                </div>
                <div className="AlarmStrategy-p marginT20">
                    <span className="AlarmStrategy-span-contents">
                        <span style={{color: "red"}}>*</span>
                        <span className="marginL5">告警内容:</span>
                    </span>
                    <div>
                        {this.alarmContent()}
                    </div>
                </div>
            </Sidebar>
        )
    }
}

export default SidebarModify