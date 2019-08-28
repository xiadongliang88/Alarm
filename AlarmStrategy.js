import React, { Component, Fragment } from 'react'
import { withRouter } from "react-router-dom"
import { injectIntl } from 'react-intl'
import { Table, Button, Layout, Select, List, message, Icon, Switch, Modal, Spin} from 'choerodon-ui'
import { Action, Content, Header, Page, stores, axios} from "choerodon-front-boot"
import SidebarDetails from './Sidebar/SidebarDetails'
import SidebarModify from './Sidebar/SidebarModify'
import SidebarAdd from './Sidebar/SidebarAdd'
import RefreshBtn from './RefreshBtn'
import '../../main.scss'
import './AlarmStrategy.scss'

let { AppState } = stores
let children

class AlarmStrategy extends Component {
    state = {
        appList: [],
        appSelected: '',
        alarmStrategy: [],
        record: {
            details: null,
            modify: null,
            discontinue: null,
        },
        visible: {
            details: false,
            modify: false,
            add: false
        },
        isEnabled: null,
        loading: true,
        users: [],
        addStrategyVisible: false,
        projectId: '',
        projectCode: '',
        projectName: '',
        pagination: {
            total: 0,
            pageSize: 0,
            current: 1
        },
        modifyKey: 0,
        addKey: 2
    }

    componentDidMount() {
        const projectId = parseInt(
            AppState.currentMenuType.projectId
        )

        this.setState({
            projectId: projectId
        })

        this.initAppList(projectId, 'firstLoading')
        this.getUsers(projectId)
    }

    reload = () => {
        const { projectId, appCode } = this.state

        this.fetchData(projectId, appCode)
        this.initAppList(projectId, '')
        this.getUsers(projectId)
    }

    handleSelectApp = value => {
        let newValueObj = {}

        for (const item of this.state.appList) {
            if (value === item.id) {
                newValueObj = item
                break
            }
        }

        this.setState({
            appSelected: newValueObj,
            appName: newValueObj.name,
            appCode: newValueObj.code
        })

        setTimeout(() => {
            const { projectId, appCode } = this.state
            this.fetchData(projectId, appCode)
        }, 0)
    }

    initAppList(projectId, condition) {
        axios.get(
            `/devops/v1/projects/${projectId}/apps`
        ).then(response => {
            this.setState({
                appList: response,
                appSelected: response[0],
                appCode: response[0].code,
                appName: response[0].name
            }, () => {
                return () => {
                    children = response.map(item => <Select.Option key={item.id} value={item.code}>{item.name}</Select.Option>)
                    return false
                }
            })

            if (condition === 'firstLoading') {
                const appCode = response[0].code
                this.fetchData(projectId, appCode)
                return
            }
        })

        axios.get(
            `iam/v1/projects/${projectId}`
        ).then(response => {
            this.setState({
                projectCode: response.code,
                projectName: response.name
            })
        })
    }

    handleResults(results) {
        this.setState({
            alarmStrategy: results,
            loading: false
        })
    }

    fetchData(projectId, appCode) {
        const pageSize = 10
        const pageNum = 1

        axios.get(
            `/alert/v1/projects/${projectId}/appalarmrule?pageNum=${pageNum}&pageSize=${pageSize}&app_code=${appCode}`
        ).then(response => {
            this.setState({
                pagination: {
                    total: response.count,
                    pageSize: 10,
                    current: 1
                }
            })

            this.handleResults(response.results)
        })
    }

    getUsers = projectId => {
        axios.get(
            `/iam/v1/projects/${projectId}/users?size=40`
        ).then(response => {
            let newAry = []

            for (const item of response.content) {
                newAry.push({
                    id: item.id,
                    username: item.realName
                })
            }

            this.setState({
                users: newAry
            })
        })
    }

    handleSidebar = (text, record, variable) => {
        if (variable === 'modify') {
            if (this.state.modifyKey === 0) {
                this.setState({ modifyKey: 1 })
            } else {
                this.setState({ modifyKey: 0 })
            }
        }

        this.setState({
            visible: {
                ...this.state.visible,
                [variable]: true
            },
            record: {
                ...this.state.record,
                [variable]: record
            }
        })
    }

    handleSidebarAdd = variable => {
        this.setState({
            visible: {
                ...this.state.visible,
                [variable]: true
            }
        })

        setTimeout(() => {
            if (this.state.addKey === 2) {
                this.setState({ addKey: 3 })
            } else {
                this.setState({ addKey: 2 })
            }
        }, 0)
    }

    handleOkDetails = () => {
        this.hideSidebar('details')
    }

    handleCancelDetails = () => {
        this.hideSidebar('details')
    }

    handleOkModify = () => {
        this.hideSidebar('modify')

        const { projectId, appCode } = this.state
        this.fetchData(projectId, appCode)
    }

    handleCancelModify = () => {
        this.hideSidebar('modify')
    }

    handleDiscontinue = (text, record) => {
        const { projectId, appCode } = this.state

        this.setState({ loading: true })

        if (record.is_enabled === true) {
            axios.post(
                `/alert/v1/projects/${projectId}/appalarmrule/${record.id}/disable`
            ).then(response => {
                if (response) {
                    this.fetchData(projectId, appCode)

                    setTimeout(() => {
                        this.setState({ loading: false })
                        message.success('已停用')
                    }, 1000)
                }
            })
        }
        else if (record.is_enabled === false) {
            axios.post(
                `/alert/v1/projects/${projectId}/appalarmrule/${record.id}/enable`
            ).then(response => {
                if (response) {
                    this.fetchData(projectId, appCode)

                    setTimeout(() => {
                        this.setState({ loading: false })
                        message.success('已启用')
                    }, 1000)
                }
            })
        }
    }

    hideSidebar = variable => {
        this.setState({
            visible: {
                ...this.state.visible,
                [variable]: false 
            }
        })
    }

    handleOkAdd = () => {
        this.hideSidebar('add')

        const { projectId, appCode } = this.state

        this.fetchData(projectId, appCode)
    }

    handleCancelAdd = () => {
        this.hideSidebar('add')
    }

    handlePageOnChange = page => {
        this.setState({
            pagination: {
                ...this.state.pagination,
                current: page.current,
                pageSize: page.pageSize
            }
        })

        const { projectId, appCode } = this.state

        axios.get(
            `/alert/v1/projects/${projectId}/appalarmrule?pageNum=${page.current}&pageSize=${page.pageSize}&app_name=${appCode}`
        ).then(response => {
            this.handleResults(response.results)
        })
    }

    render() {
        const columns = [
            {
                title: '策略名称',
                dataIndex: 'name',
                filters: [],
                onFilter: (value, record) => record.name.indexOf(value) === 0,
                key: 'name',
                width: 200
            },
            {
                title: '告警对象',
                dataIndex: 'recipients',
                filters: [],
                onFilter: (value, record) => record.name.indexOf(value) === 0,
                key: 'recipients',
                width: 200,
                render: (text, record) =>
                    <Fragment>
                        {
                            record.recipients.map(item =>
                                <div key={item.id} className="AlarmStrategy-user marginR10 marginB3" style={{background: "ebebeb"}}>
                                    <span>{`${item.username}`}</span>
                                </div>
                            )
                        }
                    </Fragment>
            },
            {
                title: '告警渠道',
                dataIndex: 'channel_templates',
                filters: [],
                onFilter: (value, record) => record.name.indexOf(value) === 0,
                key: 'channel_templates',
                width: 150,
                render: (text, record) =>
                    <Fragment>
                        {
                            record.channel_templates.wechat ?
                                <div className="AlarmStrategy-user marginR10 marginB3" style={{background: "ebebeb"}}>
                                    <span>企业微信</span>
                                </div>
                                : null
                        }
                        {
                            record.channel_templates.email ?
                                <div className="AlarmStrategy-user marginR10 marginB3" style={{background: "ebebeb"}}>
                                    <span>邮件</span>
                                </div>
                                : null
                        }
                        {
                            record.channel_templates.sms ?
                                <div className="AlarmStrategy-user marginR10 marginB3" style={{background: "ebebeb"}}>
                                    <span>短信</span>
                                </div>
                                : null
                        }
                    </Fragment>
            },
            {
                title: '最后更新人',
                dataIndex: 'modifier',
                filters: [],
                onFilter: (value, record) => record.name.indexOf(value) === 0,
                key: 'modifier',
                width: 150,
                render: (text, record) => 
                    <Fragment>
                        {record.modifier.username}
                    </Fragment>
            },
            {
                title: '最后更新时间',
                dataIndex: 'last_run_at',
                width: 150,
                key: 'last_run_at'
            },
            {
                title: '状态',
                dataIndex: 'is_enabled',
                width: 100,
                render: (text, record) =>
                    <Fragment>
                        {
                            record.is_enabled === true ?
                                <Fragment>
                                    <Icon type="brightness_1" style={{fontSize: 14, color: '#0bc2a8'}} />
                                    <span className="marginL5">已启用</span>
                                </Fragment>
                                :
                                <Fragment>
                                    <Icon type="brightness_1" style={{fontSize: 14, color: '#ffb100'}} />
                                    <span className="marginL5">已停用</span>
                                </Fragment>
                        }
                    </Fragment>
            },
            {
                title: '',
                width: 56,
                key: 'action',
                align: 'right',
                render: (text, record) => {
                    const actionDatas = [
                        {
                            icon: '',
                            type: 'site',
                            text: '详情',
                            action: () => this.handleSidebar(text, record, 'details'),
                            service: []
                        }, {
                            icon: '',
                            type: 'site',
                            text: '修改',
                            action: () => this.handleSidebar(text, record, 'modify'),
                            service: []
                        }, {
                            icon: '',
                            type: 'site',
                            text: <Fragment>{record.is_enabled ? '停用' : '启用'}</Fragment>,
                            action: () => this.handleDiscontinue(text, record),
                            service: []
                        }
                    ]

                    return <Action data={actionDatas} />
                }
            }
        ]

        return (
            <Page className="c7n-region c7n-ctf-wrapper">
                <Header title="告警策略">
                    <span className="marginR28">
                        应用
                    </span>
                    <Select
                        className="c7n-header-select"
                        dropdownClassName="c7n-header-env_drop marginL30"
                        value={this.state.appSelected.name}
                        optionFilterProp="children"
                        onSelect={this.handleSelectApp}
                        filter
                    >
                        {this.state.appList.length ? this.state.appList.map(item => <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>) : null}
                    </Select>
                    <Button onClick={() => this.handleSidebarAdd('add')}>
                        新增策略
                    </Button>
                    <RefreshBtn reload={this.reload} />
                </Header>
                <Content className="page-content">
                    <Layout style={{background: "#FFF"}}>
                    <div className="c7n-alarmStrategy-header">
                        <div className="c7n-alarmStrategy-title">
                            {this.state.appSelected.name ? `应用"${this.state.appSelected.name}"的告警策略` : null}
                        </div>
                        </div>
                        <Spin spinning={this.state.loading}>
                            <Table
                                rowKey={record => record.id}
                                className="c7n-devops-instance-table marginT5"
                                dataSource={this.state.alarmStrategy}
                                columns={columns}
                                pagination={{
                                    total: this.state.pagination.total,
                                    pageSize: this.state.pagination.pageSize,
                                    current: this.state.pagination.current,
                                    pageSizeOptions: ['10', '30', '50', '100'],
                                    defaultCurrent: 1
                                }}
                                onChange={this.handlePageOnChange}
                                selections={true}
                            >
                            </Table>
                        </Spin>
                    </Layout>
                </Content>
                {
                    this.state.record.details ?
                        <SidebarDetails
                            record={this.state.record.details}
                            visible={this.state.visible.details}
                            handleOkDetails={this.handleOkDetails}
                            handleCancelDetails={this.handleCancelDetails}
                        />
                    : null
                }
                {
                    this.state.record.modify ?
                        <SidebarModify
                            key={this.state.modifyKey}
                            record={this.state.record.modify}
                            visible={this.state.visible.modify}
                            handleOkModify={this.handleOkModify}
                            handleCancelModify={this.handleCancelModify}
                            projectId={this.state.projectId}
                            getUsers={this.state.users}
                            appInfo={this.state.appSelected}
                        />
                    : null
                }
                {
                    <SidebarAdd
                        key={this.state.addKey}
                        visible={this.state.visible.add}
                        handleOkAdd={this.handleOkAdd}
                        handleCancelAdd={this.handleCancelAdd}
                        projectId={this.state.projectId}
                        projectCode={this.state.projectCode}
                        projectName={this.state.projectName}
                        getUsers={this.state.users}
                        appInfo={this.state.appSelected}
                    />
                }
            </Page>
        )
    }
}

export default withRouter(injectIntl(AlarmStrategy))