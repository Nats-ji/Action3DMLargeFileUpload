# Action 3DM Mod Large File Upload

[![github][github-badge]][github-link] ![license][license-badge] [![version][release-badge]][release-link] [![market][market-badge]][market-link] [![3dm][3dm-badge]][3dm-link]

用来上传超过 10MB 的 Mod 文件，配合 [GlossMod/ActionUpdateMod](https://github.com/GlossMod/ActionUpdateMod) 一起使用。

### 示例 Workflow 文件

```yml
name: Release
on:
  release:
    types: [published] #在发布Release时触发

jobs:
  release:
    runs-on: ubuntu-latest #或者 windows-latest
    steps:
      - uses: actions/checkout@v3

      - name: 更新3DM Mod站信息 # 先用 GlossMod/ActionUpdateMod 更新其他信息
        uses: GlossMod/ActionUpdateMod@v1
        id: update_info # 设置个ID后面好调用这一步的output
        with:
          appid: ${{ secrets.APPID }}
          appkey: ${{ secrets.APPKEY }}
          id: 548964
          title: 我的Mod标题
          version: ${{ github.event.release.tag_name }}
          desc: 我的Mod简介
          content: README.md
          file: build/windows/myMod.asi
          zip-only: true # 设置zip-only帮我们打包

        - name: 上传Mod文件
          uses: Nats-ji/Action3DMLargeFileUpload@v1
          with:
            username: ${{ secrets.Username }} # 由于cookie的有效期只有一个
            password: ${{ secrets.Password }} # 月时间，这里使用账号密码登录
            id: 548964
            file: ${{ steps.update_info.outputs.file }} # 使用update_info这一步输出的file作为路径
```

## 输入参数

| 输入参数         | 描述                                                                        | 示例                     |
| ---------------- | --------------------------------------------------------------------------- | ------------------------ |
| username         | Mod 站登录 ID                                                               | ${{ secrets.Username }}  |
| password         | Mod 站登录密码                                                              | ${{ secrets.Password }}  |
| cookies          | Mod 站 Cookie (可用 [EditThisCookie](https://www.editthiscookie.com/) 获取) | ${{ secrets.Cookies }}   |
| id               | 你想要更新的 Mod 的 ID                                                      | 12345                    |
| file             | 要上传的 Mod 文件路径（只能上传 zip/rar/7z）                                | `./path/to/mod/file.zip` |
| timeout （可选） | 超时时长（默认 5000），单位毫秒                                             | 5000                     |
| test （可选）    | 测试，不保存                                                                | false                    |

如果 username/password 和 cookies 同时设置了，会优先使用 cookies，如果失败再尝试使用密码。

### 注意

不要直接在你的 workflow 文件里输入你的`username`, `password`和`cookies`。应将他们存放于你项目仓库的 secret 里后，使用`${{ secrets.Username }}`，`${{ secrets.Password }}`等调用。

## 贡献

欢迎在 Github 上发起 PR 来贡献此项目。

## 开源许可

本项目使用 MIT 开源许可。

[github-badge]: https://img.shields.io/badge/sorce-Github-blue?style=social&logo=github
[github-link]: https://github.com/Nats-ji/Action3DMLargeFileUpload
[license-badge]: https://img.shields.io/github/license/Nats-ji/Action3DMLargeFileUpload
[release-badge]: https://img.shields.io/github/v/release/Nats-ji/Action3DMLargeFileUpload?include_prereleases
[release-link]: https://github.com/Nats-ji/Action3DMLargeFileUpload/releases/latest
[market-badge]: https://img.shields.io/badge/visit-Github%20Marketplace-red?logo=github
[market-link]: https://github.com/marketplace/actions/3dm-mod-upload-large-file
[3dm-badge]: https://img.shields.io/badge/visit-3DM%20Mods-blueviolet?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAMAAAAolt3jAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACQ1BMVEUAAABArNme4vKC3vcDb7ux6fry9fUAbrvDgcYAgckAfr0AyP974PgAdL16zOeq4fWM1/A/wOMPvOkBxvso0f9t2vwAUKgZi9Bftda30rjFyH6ksVeZsVWKv3KAy6+G3O6g6P/A6/gAXakAYr0gfKyNomXKzXe45OLC8f8AWLEIZKyCklfc0HnS7/Pg+P8ATrVLeHrq5rLo//8AT6uEilDr0Xfy/v8IU5+Xjj7gv1r6/PMIU56Wjj/iwFn6/PIAT6uCiVHtznTy9f8ATrVKd3rwwKjwsegAV7EKZKuBkVjsvHX2u9r4js0AXKcAYr4adqmBmV/FwnTOts30nNX/r84Aa7IAcMgMgcFImJWDqWiarVSXr1eGu3KAyayH2eyrzPjxK40Ag9MAjuUBnuQLreAMueYExfcr0v9u3v7VrySWgC5mWixfTRyHaRXXsSHSoxJ6aC6afiV6ZihQRys8NimHZxGqhBa0liZ2ZjZfVz57aTJMSj5HRTt9ZiM6NixANR26liiGcjYvPF1pYERWU0tMTUthVjWXeB6WdBNpVBtpYUmVfDNeXFBqYkhDSVhqYEFZVELlqwjNmgpTRSBoYk/AlyCbgTRpY1C8lCBfWktHS1FtYDhgVTFMQyqCc0WXfzrmrQtkYVVsZk9rZEpjXEhhWUBnWjOuhxavlDCliDH1tgLVoxSpiS6ggzCReTNOTklJRUXgqiTrswr5twD3twHcpxHImxuWfDFWUkinhSnasRnwsgaQeTtnYE59bT+zmzT///8AkcssAAAAaXRSTlMAAAAAAAAAAAAAAAAAARliiXdgRSMJARt32/Hv69qnURMBARVs4t9tEgpP3OFSByKkrB5F2d9EXuvwYF/s8WFH3OJHI6rILgpU4vedFQEUcuToji4BARRYsuPz8+S1WRMBCSNMaWlMIQbpgJCLAAAAAWJLR0TAE2Hf+AAAAAd0SU1FB+YMDhYhCLMJih4AAADdSURBVAjXAdIALf8AAAENDg8QERITFBUCAwAABBYXGBkaGxwdHh8gIQUAIiMkJWlqa2xtbiYnKAYAKSorb3BxcnN0dXYsLS4ALzB3eHl6e3x9fn+AMTIAMzSBgoOEhXiGh4iJNTYANziKi4yNjo+QkZKTOToAOzyUlZaXmJmam5ydPT4AP0Cen6ChoqOkpaanQUIAQ0SoqaqrrK2ur7CxRUYAR0hJsrO0tba3uLlKS0wATU5PULq7vL2+v1FSU1QAB1VWV1hZWltcXV5fYAgAAAkKYWJjZGVmZ2gLDACnP0gZKTKyjAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMi0xMi0xNFQyMjozMzowOCswMDowMKCA94IAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjItMTItMTRUMjI6MzM6MDgrMDA6MDDR3U8+AAAAKHRFWHRkYXRlOnRpbWVzdGFtcAAyMDIyLTEyLTE0VDIyOjMzOjA4KzAwOjAwhshu4QAAAABJRU5ErkJggg==
[3dm-link]: https://mod.3dmgame.com/mod/174709
