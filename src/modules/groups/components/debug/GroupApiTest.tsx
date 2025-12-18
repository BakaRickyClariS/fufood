import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { groupsApi } from '../../api/groupsApi';
import { useAuth } from '@/modules/auth';

export const GroupApiTest = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (msg: string) => {
    console.log(`[API Test] ${msg}`);
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
  };

  const runTest = async () => {
    setLoading(true);
    setLogs([]);
    addLog('🚀 開始 API 測試...');
    addLog(`目前使用者: ${user?.displayName || '未登入'}`);

    try {
      // 1. 取得所有群組
      addLog('1. GET /api/v1/refrigerators (List)');
      const groups = await groupsApi.getAll();
      addLog(`✅ 取得群組成功: ${groups.length} 筆資料`);
      console.log('Groups:', groups);

      // 2. 建立新群組
      addLog('2. POST /api/v1/refrigerators (Create)');
      const newGroup = await groupsApi.create({ name: '測試冰箱-' + Date.now() });
      addLog(`✅ 建立群組成功: ID=${newGroup.id}, Name=${newGroup.name}`);

      // 3. 取得單一群組
      if (newGroup.id) {
        addLog(`3. GET /api/v1/refrigerators/${newGroup.id} (GetById)`);
        const fetchedGroup = await groupsApi.getById(newGroup.id);
        addLog(`✅ 取得單一群組成功: ${fetchedGroup.name}`);
      }

      // 4. 更新群組
      if (newGroup.id) {
        addLog(`4. PUT /api/v1/refrigerators/${newGroup.id} (Update)`);
        const updatedGroup = await groupsApi.update(newGroup.id, {
          name: newGroup.name + ' (已更新)',
        });
        addLog(`✅ 更新群組成功: Name=${updatedGroup.name}`);
      }

      // 5. 刪除群組
      if (newGroup.id) {
        addLog(`5. DELETE /api/v1/refrigerators/${newGroup.id} (Delete)`);
        await groupsApi.delete(newGroup.id);
        addLog('✅ 刪除群組成功');
      }

      addLog('🎉 所有測試完成！');
    } catch (error: any) {
      console.error(error);
      addLog(`❌ 測試失敗: ${error.message || '未知錯誤'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-4 border border-dashed border-red-300 rounded-lg bg-red-50">
      <h3 className="text-red-800 font-bold mb-2">🚧 開發者測試區：群組 API</h3>
      <div className="mb-4 text-sm text-red-600">
        此區域僅供測試 API 串接，請勿在正式環境使用。
      </div>
      
      <Button 
        onClick={runTest} 
        disabled={loading}
        className="w-full bg-red-500 hover:bg-red-600 text-white"
      >
        {loading ? '測試中...' : '執行 API 測試'}
      </Button>

      {logs.length > 0 && (
        <div className="mt-4 p-3 bg-black text-green-400 text-xs font-mono rounded overflow-auto h-48">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      )}
    </div>
  );
};
