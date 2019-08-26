import React, { Component, Fragment } from 'react'
import { Modal, Input, Select, Icon, List, message } from 'choerodon-ui'
import { Content, Header, Page, stores, axios} from "choerodon-front-boot"
import { Button } from 'choerodon-ui/lib/radio';

const { Sidebar } = Modal

class SidebarModify extends Component {
    state = {
        // 策略名称
        name: '',
        // 统计周期
        interval: 1,
        // 统计阈值
        threshold: 1,
        // 告警对象
        recipients: '',
        // 用户列表
        users: [],
        // 关系
        relationship: '',
        relationshipOpt: ['AND', 'OR'],
        // 主键
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
        channelAry: [
            {
                label: '',
                value: ''
            }
        ],
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
        filterRule: [
            {
                relation: '',
                children: [
                    {
                        field: '',
                        condition: '',
                        query: '',
                        relation: ''
                    }
                ]
            }
        ],
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

    handleInput = (e, variable) => {
        if (variable === 'name') {
            const projectId = this.props.projectId
            const appName = this.props.appInfo.name
            const value = e.target.value

            if (value !== '' ) {
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

    // 告警渠道
    handleChannelSelect = (value, e, index) => {
        let newChannelAry = [ ...this.state.channelAry ]

        newChannelAry[index].label = value
        newChannelAry[index].value = e.props.message

        this.setState({
            channelAry: newChannelAry
        })
    }

    // 告警内容
    handleAddChange = (index, e) => {
        let newChannelAry = [ ...this.state.channelAry ]

        newChannelAry[index].value = e.target.value

        this.setState({
            channelAry: newChannelAry
        })

        // setTimeout(console.log('channelAry', this.state.channelAry), 0)
    }

    // 告警对象 -> 多选
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

    // 添加告警渠道
    handleAddChannel = () => {
        let channelAry = [ ...this.state.channelAry ]

        channelAry.push({
            label: '',
            value: ''
        })

        this.setState({
            channelAry: channelAry
        })

        // setTimeout(console.log('channelAry', this.state.channelAry), 0)
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

        // setTimeout(console.log(this.state.channelAry), 0)
    }

    alarmContent = () => {
        return (
            <Fragment>
                {
                    this.state.channelAry.map((item, index) =>
                        <div key ={index} className="AlarmStrategy-span-contents-item">
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
        // console.log('handleSubItemSelect', value, subIndex, index, variable)

        let newList = [ ...this.state.filterRule ]

        newList[index].children[subIndex][variable] = value

        this.setState({
            filterRule: newList
        })

        // setTimeout(console.log('filterRule', this.state.filterRule))
    }

    handleSubItemInput = (e, subIndex, index, variable) => {
        // console.log(e, e.target.value)

        let newList = [ ...this.state.filterRule ]

        newList[index].children[subIndex][variable] = e.target.value

        this.setState({
            filterRule: newList
        })

        // setTimeout(console.log('filterRule', this.state.filterRule))
    }

    handleRelationOutSide = (value, index) => {
        // console.log('handleRelationOutSide', value, index)

        let newList = [ ...this.state.filterRule ]

        newList[index].relation = value

        this.setState({
            filterRule: newList
        })

        // setTimeout(console.log('filterRule', this.state.filterRule))
    }

    // 新增一条二级对象
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

        // setTimeout(console.log('filterRule', this.state.filterRule))
    }

    // 删除当前二级对象
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

        // setTimeout(console.log('filterRule', this.state.filterRule))
    }

    // 新增规则组
    handleAddItem = () => {
        // console.log('handleAddItem')

        let newList = [ ...this.state.filterRule ]

        newList.push({
            relation: 'AND',
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
            message.error('规则组最少为一组')
        }
    }

    // 确定
    handleOkModify = () => {
        let filterRuleCheck = true
        const channelAry = [ ...this.state.channelAry ]

        // 告警规则校验
        // console.log('filterRule', this.state.filterRule)

        const { filterRule } = this.state

        for (let i = 0; i < filterRule.length; i++) {
            for (let k = 0; k < filterRule[i].children.length ; k++) {
                if (filterRule[i].children[k].field === '') {
                    filterRuleCheck = false
                }
                if (filterRule[i].children[k].condition === '') {
                    filterRuleCheck = false
                }
                if (filterRule[i].children[k].query === '') {
                    filterRuleCheck = false
                }
                if (filterRule[i].children[k].relation === '' && k !== filterRule[i].children.length - 1) {
                    filterRuleCheck = false
                }
            }
        }

        // 告警渠道校验
        const newAry = channelAry.slice().sort()
        // console.log('channelAry', channelAry)

        let channelCheck = true

        for (let i = 0; i < channelAry.length - 1; i++) {
            if (newAry[i].label === newAry[i+1].label) {
                channelCheck = false
                break
            }
        }

        // console.log('channelCheck', channelCheck)

        const reg = /^\d+$/

        // 策略名称校验
        if (this.state.nameRepeat === true) {
            message.error('策略名称已存在')
            return
        }
        if (this.state.name === '') {
            message.error('策略名称不能为空')
            return
        }

        // interval 统计周期
        if (!reg.test(this.state.interval)) {
            message.error('统计周期必须为数字')
            return
        }

        if (this.state.interval < 1 || this.state.interval > 1440) {
            message.error('统计周期为1-1400之间任意数')
            return
        }

        // threshold 告警阈值
        if (!reg.test(this.state.threshold)) {
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

        const appInfo = {
            app_code: this.props.appInfo.code,
            app_name: this.props.appInfo.name,
            project_code: this.props.projectCode,
            project_id: this.props.projectId,
            project_name: this.props.projectName
        }

        const data = {
            name: this.state.name,
            app_info: appInfo,
            is_enabled: true,
            interval: this.state.interval,
            threshold: this.state.threshold,
            filter_rule: this.state.filterRule,
            recipients: this.state.recipients,
            channel_templates: channelTemplates
        }

        const { projectId } = this.props

        axios.post(
            `/alert/v1/projects/${projectId}/appalarmrule`, data
        ).then(res => {
            if (res) {
                message.success('新增规则成功')
                this.props.handleOkAdd()
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
                title="新增"
                visible={this.props.visible}
                onOk={() => this.handleOkModify()}
                onCancel={this.props.handleCancelAdd}
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
                    <Input style={{width:480}} value={this.state.threshold} placeholder='输入1-32767之间任意数' onChange={e => this.handleInput(e, 'threshold')} type='number' />
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
                                                        <Select.Option key={item}>
                                                            {item}
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