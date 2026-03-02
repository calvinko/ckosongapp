import subprocess

query_to_remove = """
1. 人 生 每 一 程 ， 祢 同 在 ， 常 同 在 。                                   
不 怕 路 難 行 ， 不 怕 風 雨 阻 ；                 
不 怕 深 谷 幽 暗 ，                                
不 怕 沒 有 日 光 。

2. 過著每一天，祢同在，常同在。
也許事務忙，也許擔子重；
也許不能入睡，也許心事重重。

3. 就在這一刻，祢同在，常同在。
只有我在這裡，只有自己明白；
卻有祢的陪伴，有祢知道。

4. 祢 同 在 ， 常 同 在 ，
祢 應 許 永 遠 同 在 ，
祢 柔 和 的 臉 光 ，
祢 真 情 的 一 句 ，
祢 的 親 近 扶 一 把 ，
什 麼 都 不 怕 ！
祢 的 親 近 扶 一 把 ，
什 麼 都 可 以 ！


"""

new_query = query_to_remove.replace(" ", "")
print(new_query)

## ADDS TO COPY AND PASTE ON MAC ###
subprocess.run("pbcopy", text=True, input=new_query)
