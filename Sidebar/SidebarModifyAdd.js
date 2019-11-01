import React, { Fragment, PureComponent } from 'react'
import { Modal, Input, Select, Icon, List, message } from 'choerodon-ui'
import { axios } from "choerodon-front-boot"
import { Button } from 'choerodon-ui/lib/radio'

const { Sidebar } = Modal

let children = []

class SidebarModifyAdd extends PureComponent {

    constructor(props) {
        super(props)
    }

    state = {
        name: this.props.mode === 'Modify'? this.props.record.name : '',
        interval: this.props.mode === 'Modify'? this.props.record.interval : 1,
        threshold: this.props.mode === 'Modify'? this.props.record.threshold : 1,
        recipients: this.props.mode === 'Modify'? this.props.record.recipients : '',
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
            'message', 
            'env', 
            '@version', 
            '@timestamp', 
            'host',
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
        channelAry: this.props.mode === 'Modify' ? this.handleChannelAry() : [
            {
                label: '',
                value: '',
                disabled: false
            }
        ],
        channelOptOrg: [
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
        channelOptAry: [],
        filterRule: this.props.mode === 'Modify' ? this.props.record.filter_rule : [
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
        nameRepeat: false,
        getUsers: this.props.getUsers
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

        const initChannel = this.initChannel()

        this.setState({
            channelAry: initChannel.channelAry,
            channelOptAry: initChannel.channelOptAry
        })
    }

    initChannel = () => {

        let channelAry = [ ...this.state.channelAry ]
        let channelOptAry = [ ...this.state.channelOptAry ]

        if (channelAry.length === 1) {

            let channelOptOrg = [ ...this.state.channelOptOrg ]

            channelOptAry.push(channelOptOrg)

        } else if (channelAry.length === 2 || channelAry.length === 3) {

            let channelOptOrg = [ ...this.state.channelOptOrg ]
            let labelIndex1
            let labelIndex2
            let labelIndex3
            let kAry = []
            let lastOne

            for (let i = 0; i < channelAry.length; i++) {
                for (let k = 0; k < channelOptOrg.length; k++) {

                    if (channelAry[i].label === channelOptOrg[k].label) {

                        kAry.push(k)
                    } else {

                        lastOne = k
                    }
                }
            }

            if (kAry.length === 2) {

                labelIndex1 = kAry[0]
                labelIndex2 = kAry[1]
                labelIndex3 = lastOne
                channelOptAry.push(channelOptOrg)
                channelOptAry.push([ channelOptOrg[labelIndex2], channelOptOrg[labelIndex3] ])
                channelAry[0].disabled = true
            }

            if (kAry.length === 3) {

                labelIndex1 = kAry[0]
                labelIndex2 = kAry[1]
                labelIndex3 = kAry[2]
                channelOptAry.push(channelOptOrg)
                channelOptAry.push([ channelOptOrg[labelIndex2], channelOptOrg[labelIndex3] ])
                channelOptAry.push([ channelOptOrg[labelIndex3] ])
                channelAry[0].disabled = true
                channelAry[1].disabled = true
            }
        }

        return { channelAry: channelAry, channelOptAry: channelOptAry } 
    }

    loopTemp(temp) {

        let channelAry = []

        const words = [
            'wechat',
            'sms',
            'email'
        ]

        for (const item of words) {
            for (const subItem of temp) {
                if (subItem.label === item) {
                    channelAry.push(subItem)
                    break
                }
            }
        }

        return channelAry
    }

    handleChannelAry() {

        let temp = []
        const channelTemplates = { ...this.props.record.channel_templates }

        for (let key in channelTemplates) {
            temp.push({
                label: key,
                value: channelTemplates[key],
                disabled: false
            })
        }

        const channelAry = this.loopTemp(temp)

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

    handleRemoteSearch = value => {

        axios.get(
            `/iam/v1/projects/${this.props.projectId}/users?param=${value}`
        ).then(response => {
            let newAry = []

            for (const item of response.content) {
                newAry.push({
                    id: item.id,
                    username: item.realName
                })
            }

            this.setState({
                getUsers: newAry
            })
        })
    }

    handleAddChannel = () => {

        let channelAry = [ ...this.state.channelAry ]
        let channelOptAry = [ ...this.state.channelOptAry ]

        if (channelAry.length >= 3) {
            message.error('告警渠道最多为3项')
            return
        }

        if (
            channelAry.length >= 1 &&
            (channelAry[channelAry.length - 1].label === ''|| channelAry[channelAry.length - 1].value === '')
        ) {
            message.error('告警渠道未填写')
            return
        }

        if (channelAry.length === 0) {

            channelOptAry.push(this.state.channelOptOrg)
            channelAry.push({
                label: '',
                value: ''
            })
        } 
        else if (channelAry.length >= 1) {

            const preLabel = channelAry[channelAry.length - 1].label

            let ary = [ ...channelOptAry[channelOptAry.length - 1] ]

            for (let i = 0 ; i < ary.length; i++) {
                if (preLabel === ary[i].label) {
                    ary.splice(i, 1)
                }
            }

            channelOptAry.push(ary)
            channelAry.push({
                label: '',
                value: '',
                disabled: false
            })

            channelAry[channelAry.length - 2].disabled = true

            this.setState({
                channelOptAry: channelOptAry,
                channelAry: channelAry
            })
        }
    }

    handleDeleteChannel = index => {

        let channelAry = [ ...this.state.channelAry ]
        let channelOptAry = [ ...this.state.channelOptAry ]

        if (channelAry.length > 1) {

            channelAry.splice(index, 1)
            channelOptAry.pop()
            channelAry[channelAry.length - 1].disabled = false

            this.setState({
                channelAry: channelAry,
                channelOptAry: channelOptAry
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
                                    <span style={{color: "red"}}>
                                        *
                                    </span>
                                    <span className="marginL5">
                                        告警渠道:
                                    </span>
                                </span>
                                <Select style={{width:480}} value={item.label} disabled={item.disabled} onSelect={(value, e) => this.handleChannelSelect(value, e, index)}>
                                    {
                                        this.state.channelOptAry instanceof Array && this.state.channelOptAry.length > 0 ?
                                        this.state.channelOptAry[index] instanceof Array && this.state.channelOptAry[index].map(optItem =>
                                                <Select.Option key={optItem.label} value={optItem.label} message={optItem.message}>
                                                    {optItem.value}
                                                </Select.Option>
                                            ) : null
                                    }
                                </Select>
                                <Icon className="marginL20" type="delete" style={{float: "right", cursor: "pointer"}} onClick={() => this.handleDeleteChannel(index)} />
                            </div>
                            <div className="AlarmStrategy-m marginT10">
                                <span className="AlarmStrategy-span-label-sub gray">
                                    <span style={{color: "red"}}>
                                        *
                                    </span>
                                    <span className="marginL5">
                                        告警消息:
                                    </span>
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

    handleAddSub = index => {

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

    handleOkModifyAdd = () => {

        let filterRuleCheck = true
        const channelAry = [ ...this.state.channelAry ]
        const { filterRule } = this.state

        const regS = /^\S+$/

        for (let i = 0; i < filterRule.length; i++) {

            for (let k = 0; k < filterRule[i].children.length ; k++) {
                if (filterRule[i].children[k].field === '') {
                    filterRuleCheck = false
                }

                if (filterRule[i].children[k].condition === '') {
                    filterRuleCheck = false
                }

                if (filterRule[i].children[k].query === '' || regS.test(filterRule[i].children[k].query) === false) {
                    filterRuleCheck = false
                }

                if (filterRule[i].children[k].relation === '' && k !== filterRule[i].children.length - 1) {
                    filterRuleCheck = false
                }
            }
        }

        let newLabels = []

        for (const item of channelAry) {
            newLabels.push(item.label)
        }

        const newLabelsSort = newLabels.slice().sort()  //  排序

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

        const { projectId } = this.props
        const { id } = this.props.record

        const appInfo = {
            app_code: this.props.appInfo.code,
            app_name: this.props.appInfo.name,
            project_code: this.props.projectCode,
            project_id: this.props.projectId,
            project_name: this.props.projectName
        }

        if (this.props.mode === 'Modify') {

            const data = {
                name: this.state.name,
                app_info: appInfo,
                is_enabled: this.props.record.is_enabled,
                interval: this.state.interval,
                threshold: this.state.threshold,
                filter_rule: this.state.filterRule,
                recipients: this.state.recipients,
                channel_templates: channelTemplates
            }

            axios.put(
                `/alert/v1/projects/${projectId}/appalarmrule/${id}`, data
            ).then(res => {

                if (res) {
                    message.success('修改规则成功')
                    this.props.handleOkModifyAdd()
                } 
                else {
                    message.success('修改规则失败')
                }
            }).catch(error => {
                message.error(error.response.request.responseText)
            })
        } else if (this.props.mode === 'Add') {
    
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

            axios.post(
                `/alert/v1/projects/${projectId}/appalarmrule`, data
            ).then(res => {
                if (res) {
                    message.success('新增规则成功')
                    this.props.handleOkModifyAdd()
                } else {
                    message.success('修改规则失败')
                }
            }).catch(error => {
                message.error(error.response.request.responseText)
            })
        }
    }

    render() {
        return (
            <Sidebar
                title="修改"
                visible={this.props.visible}
                onOk={() => this.handleOkModifyAdd()}
                onCancel={this.props.handleCancelModify}
                cancelText="取消"
                okText="确定"
            >
                <div className="AlarmStrategy-p marginT20">
                    <span className="AlarmStrategy-span-label">
                        <span style={{color: "red"}}>
                            *
                        </span>
                        <span className="marginL5">
                            策略名称:
                        </span>
                    </span>
                    <Input style={{width:480}} value={this.state.name} onChange={e => this.handleInput(e, 'name')} maxLength={32} />
                </div>
                <div className="AlarmStrategy-p marginT20">
                    <span className="AlarmStrategy-span-label">
                        <span style={{color: "red"}}>
                            *
                        </span>
                        <span className="marginL5">
                            统计周期:
                        </span>
                    </span>
                    <Input style={{width:480}} value={this.state.interval} placeholder='输入1-1440之间任意数' onChange={e => this.handleInput(e, 'interval')} type='number' />{` 分`}
                    <p className="gray marginL80">
                        输入1-1440之间任意数, 默认值为1
                    </p>
                </div>
                <div className="AlarmStrategy-p marginT20">
                    <span className="AlarmStrategy-span-label">
                        <span style={{color: "red"}}>
                            *
                        </span>
                        <span className="marginL5">
                            告警阈值:
                        </span>
                    </span>
                    <Input style={{width:480}} value={this.state.threshold} placeholder='输入1-32767之间任意数' onChange={e => this.handleInput(e, 'threshold')} />
                    <p className="gray marginL80">
                        输入1-32767之间任意数, 默认值为1
                    </p>
                </div>
                <div className="AlarmStrategy-p marginT20">
                    <span className="AlarmStrategy-span-label">
                        <span style={{color: "red"}}>
                            *
                        </span>
                        <span className="marginL5">
                            告警规则:
                        </span>
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
                                                <Select style={{width: 120}} disabled />
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
                                                onClick={() => this.handleAddSub(index)}
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
                                                onClick={() => this.handleAddSub(index)}
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
                        <span style={{color: "red"}}>
                            *
                        </span>
                        <span className="marginL5">
                            告警对象:
                        </span>
                    </span>
                    <Select
                        mode="multiple"
                        style={{width:480}}
                        optionFilterProp="children"
                        value={this.state.values}
                        onChange={this.handleMultSelect}
                        onSearch={this.handleRemoteSearch}
                        filter
                    >
                        {
                            this.state.getUsers.length ? this.state.getUsers.map(item => 
                                <Select.Option key={item.id} value={item.username}>{item.username}</Select.Option>) : null
                        }
                    </Select>
                </div>
                <div className="AlarmStrategy-p marginT20">
                    <span className="AlarmStrategy-span-contents">
                        <span style={{color: "red"}}>
                            *
                        </span>
                        <span className="marginL5">
                            告警内容:
                        </span>
                    </span>
                    <div>
                        {this.alarmContent()}
                    </div>
                </div>
            </Sidebar>
        )
    }
}

export default SidebarModifyAdd