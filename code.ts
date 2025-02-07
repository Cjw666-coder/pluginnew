// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {
  width: 320,
  height: 700
});

// 获取当前文档URL并发送到UI
const currentPage = figma.currentPage;
const fileUrl = figma.fileKey ? `https://www.figma.com/file/${figma.fileKey}` : '未找到URL';
figma.ui.postMessage({ type: 'update-url', url: fileUrl });

interface TaskData {
  projectName: string;
  taskType: string;
  priority: string;
  taskDetail: string;
  direction: string;
  startDate: string;
  endDate: string;
  designTime: string;
  attachments: string[];
}

export const API_CONFIG = {
  BASE_URL: 'https://is-gateway-test.corp.kuaishou.com',
  ENDPOINT: '/pm/api/no-ba/external/task/getChildrenTasks'
} as const;

async function getTaskData() {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINT}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      figma.ui.postMessage({
        type: 'task-data',
        data: data
      });
    }
  } catch (error) {
    figma.ui.postMessage({
      type: 'api-error',
      error: (error as Error).message
    });
  }
}

// 当选择变化时，更新 URL 并获取任务数据
figma.on('selectionchange', () => {
  const selection = figma.currentPage.selection;
  if (selection.length > 0) {
    const selectedNode = selection[0];
    const nodeId = selectedNode.id;
    const fileKey = figma.fileKey;
    const frameUrl = `https://www.figma.com/file/${fileKey}/${figma.root.name}?node-id=${nodeId}`;
    
    figma.ui.postMessage({ 
      type: 'selection-change',
      url: frameUrl,
      nodeName: selectedNode.name
    });
    
    // 获取任务数据
    getTaskData();
  }
});

// API 配置
const API_CONFIG = {
  BASE_URL: 'https://is-gateway-test.corp.kuaishou.com',
  ENDPOINT: '/pm/api/no-ba/external/task/getChildrenTasks'
};

async function getApiInfo() {
  try {
    const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINT}`;
    
    // 发送 API 信息到 UI
    figma.ui.postMessage({
      type: 'api-info',
      data: {
        url: apiUrl,
        environment: '测试环境'
      }
    });
    
    // 尝试调用 API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 如果需要其他请求头，在这里添加
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      figma.ui.postMessage({
        type: 'api-response',
        data: data
      });
    } else {
      throw new Error(`API 请求失败: ${response.status}`);
    }
    
  } catch (error) {
    console.error('API 请求错误:', error);
    figma.ui.postMessage({
      type: 'api-error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// 定义接口返回的数据类型
interface FieldResponse {
  // 根据实际API返回数据结构定义
  code: number;
  data: any;
  message: string;
}

// 添加获取字段的函数
async function getFields() {
  try {
    const response = await fetch('你的API基础URL/pm/api/no-ba/external/task/getFields', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 如果需要认证，添加认证头
        // 'Authorization': 'Bearer YOUR_TOKEN'
      }
    });
    
    const data: FieldResponse = await response.json();
    
    // 发送数据到UI
    figma.ui.postMessage({
      type: 'fields-data',
      data: data
    });
    
  } catch (error) {
    console.error('获取字段失败:', error);
    figma.ui.postMessage({
      type: 'api-error',
      error: '获取字段失败'
    });
  }
}

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage =  (msg: {type: string, count: number}) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === 'create-shapes') {
    // This plugin creates rectangles on the screen.
    const numberOfRectangles = msg.count;

    const nodes: SceneNode[] = [];
    for (let i = 0; i < numberOfRectangles; i++) {
      const rect = figma.createRectangle();
      rect.x = i * 150;
      rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }];
      figma.currentPage.appendChild(rect);
      nodes.push(rect);
    }
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};
